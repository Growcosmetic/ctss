// ============================================
// Monthly Report - Generate monthly summary
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { monthlyReportRecommendationsPrompt } from "@/core/prompts/monthlyReportRecommendationsPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { month, year } = await req.json();

    const reportMonth = month || new Date().getMonth() + 1;
    const reportYear = year || new Date().getFullYear();

    // Check if report already exists
    const existing = await prisma.monthlyReport.findUnique({
      where: {
        reportMonth_reportYear: {
          reportMonth,
          reportYear,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        report: existing,
        message: "Report already exists for this month",
      });
    }

    // Calculate date range
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);

    // Previous month for comparison
    const prevStartDate = new Date(reportYear, reportMonth - 2, 1);
    const prevEndDate = new Date(reportYear, reportMonth - 1, 0, 23, 59, 59);

    // 1. Revenue Summary
    const invoices = await prisma.invoice.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    const prevInvoices = await prisma.invoice.findMany({
      where: {
        date: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const prevRevenue = prevInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const revenueGrowth =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // 2. Product Cost
    const mixLogs = await prisma.mixLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
        service: true,
      },
    });

    const prevMixLogs = await prisma.mixLog.findMany({
      where: {
        createdAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
    });

    const totalCost = mixLogs.reduce((sum, log) => sum + log.cost, 0);
    const prevCost = prevMixLogs.reduce((sum, log) => sum + log.cost, 0);
    const costChange = prevCost > 0 ? ((totalCost - prevCost) / prevCost) * 100 : 0;

    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // 3. Customer Metrics
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
      },
    });

    const customerIds = new Set(bookings.map((b) => b.customerId));
    const totalCustomers = customerIds.size;

    // Check returning customers (had bookings before this month)
    const prevBookings = await prisma.booking.findMany({
      where: {
        date: {
          lt: startDate,
        },
      },
      select: {
        customerId: true,
      },
    });

    const prevCustomerIds = new Set(prevBookings.map((b) => b.customerId));
    const returningCustomers = Array.from(customerIds).filter((id) =>
      prevCustomerIds.has(id)
    ).length;
    const newCustomers = totalCustomers - returningCustomers;
    const returnRate =
      totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    // 4. Service Performance
    const serviceRevenue: Record<string, number> = {};
    const serviceCost: Record<string, number> = {};
    const serviceCount: Record<string, number> = {};

    for (const invoice of invoices) {
      for (const item of invoice.items) {
        const serviceName = item.service.name;
        serviceRevenue[serviceName] =
          (serviceRevenue[serviceName] || 0) + item.price;
        serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
      }
    }

    for (const log of mixLogs) {
      if (log.serviceId && log.service) {
        const serviceName = log.service.name;
        serviceCost[serviceName] = (serviceCost[serviceName] || 0) + log.cost;
      }
    }

    const serviceProfit: Record<string, any> = {};
    for (const serviceName in serviceRevenue) {
      const revenue = serviceRevenue[serviceName];
      const cost = serviceCost[serviceName] || 0;
      const profit = revenue - cost;
      serviceProfit[serviceName] = {
        revenue,
        cost,
        profit,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0,
        count: serviceCount[serviceName] || 0,
      };
    }

    // Service trends (compare with previous month)
    const prevServiceRevenue: Record<string, number> = {};
    const prevInvoicesWithItems = await prisma.invoice.findMany({
      where: {
        date: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    for (const invoice of prevInvoicesWithItems) {
      for (const item of invoice.items) {
        const serviceName = item.service.name;
        prevServiceRevenue[serviceName] =
          (prevServiceRevenue[serviceName] || 0) + item.price;
      }
    }

    const serviceTrends: Record<string, number> = {};
    for (const serviceName in serviceRevenue) {
      const current = serviceRevenue[serviceName];
      const previous = prevServiceRevenue[serviceName] || 0;
      serviceTrends[serviceName] =
        previous > 0 ? ((current - previous) / previous) * 100 : 0;
    }

    // Services by category
    const servicesByCategory: Record<string, number> = {};
    for (const invoice of invoices) {
      for (const item of invoice.items) {
        const category = item.service.category;
        servicesByCategory[category] =
          (servicesByCategory[category] || 0) + item.price;
      }
    }

    // 5. Product Usage
    const productUsage: Record<
      string,
      {
        productName: string;
        unit: string;
        category: string;
        totalQty: number;
        totalCost: number;
      }
    > = {};

    for (const log of mixLogs) {
      const key = log.productId;
      if (!productUsage[key]) {
        productUsage[key] = {
          productName: log.product.name,
          unit: log.product.unit,
          category: log.product.category,
          totalQty: 0,
          totalCost: 0,
        };
      }
      productUsage[key].totalQty += log.actualQty;
      productUsage[key].totalCost += log.cost;
    }

    // Usage by category
    const usageByCategory: Record<string, { qty: number; cost: number }> = {};
    for (const key in productUsage) {
      const product = productUsage[key];
      if (!usageByCategory[product.category]) {
        usageByCategory[product.category] = { qty: 0, cost: 0 };
      }
      usageByCategory[product.category].qty += product.totalQty;
      usageByCategory[product.category].cost += product.totalCost;
    }

    // Average usage per service
    const averageUsagePerService: Record<string, number> = {};
    for (const log of mixLogs) {
      if (log.serviceId && log.service) {
        const serviceName = log.service.name;
        const count = serviceCount[serviceName] || 1;
        averageUsagePerService[serviceName] =
          (averageUsagePerService[serviceName] || 0) + log.actualQty / count;
      }
    }

    // 6. Inventory Movement
    const stockLogs = await prisma.stockLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let stockIn = 0;
    let stockOut = 0;

    for (const log of stockLogs) {
      if (log.type === "IN") {
        stockIn += Math.abs(log.quantity) * (log.pricePerUnit || 0);
      } else if (log.type === "OUT") {
        stockOut += Math.abs(log.quantity) * (log.pricePerUnit || 0);
      }
    }

    // Ending stock (from projections)
    const projections = await prisma.inventoryProjection.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        product: true,
      },
    });

    const endingStock = projections.reduce(
      (sum, p) => sum + p.currentStock * (p.product.pricePerUnit || 0),
      0
    );

    // Excess stock (daysUntilEmpty > 60)
    const excessStock = projections
      .filter((p) => (p.daysUntilEmpty || 0) > 60)
      .slice(0, 10)
      .map((p) => ({
        productName: p.product.name,
        unit: p.product.unit,
        currentStock: p.currentStock,
        daysUntilEmpty: p.daysUntilEmpty,
      }));

    // Low stock items
    const lowStockItems = projections
      .filter((p) => p.needsRestock)
      .slice(0, 10)
      .map((p) => ({
        productName: p.product.name,
        unit: p.product.unit,
        currentStock: p.currentStock,
        daysUntilEmpty: p.daysUntilEmpty,
      }));

    // 7. Loss & Fraud
    const lossAlerts = await prisma.lossAlert.findMany({
      where: {
        detectedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
        staff: true,
      },
    });

    const lossRates = lossAlerts
      .filter((a) => a.lossRate !== null)
      .map((a) => a.lossRate!);
    const averageLossRate =
      lossRates.length > 0
        ? lossRates.reduce((sum, r) => sum + r, 0) / lossRates.length
        : 0;

    // Previous month loss rate
    const prevLossAlerts = await prisma.lossAlert.findMany({
      where: {
        detectedAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
    });

    const prevLossRates = prevLossAlerts
      .filter((a) => a.lossRate !== null)
      .map((a) => a.lossRate!);
    const prevAverageLossRate =
      prevLossRates.length > 0
        ? prevLossRates.reduce((sum, r) => sum + r, 0) / prevLossRates.length
        : 0;

    const lossChange =
      prevAverageLossRate > 0
        ? ((averageLossRate - prevAverageLossRate) / prevAverageLossRate) * 100
        : 0;

    // High loss products
    const lossByProduct: Record<string, number> = {};
    for (const alert of lossAlerts) {
      if (alert.lossRate && alert.product) {
        const key = alert.product.name;
        if (!lossByProduct[key] || alert.lossRate > lossByProduct[key]) {
          lossByProduct[key] = alert.lossRate;
        }
      }
    }

    const highLossProducts = Object.entries(lossByProduct)
      .filter(([_, rate]) => rate > 15)
      .map(([name, rate]) => ({
        productName: name,
        lossRate: Math.round(rate * 100) / 100,
      }));

    // Suspicious staff
    const staffAlertCounts: Record<string, number> = {};
    const staffFraudScores: Record<string, number[]> = {};

    for (const alert of lossAlerts) {
      if (alert.staff) {
        const staffName = alert.staff.name;
        staffAlertCounts[staffName] = (staffAlertCounts[staffName] || 0) + 1;
        if (alert.fraudScore) {
          if (!staffFraudScores[staffName]) {
            staffFraudScores[staffName] = [];
          }
          staffFraudScores[staffName].push(alert.fraudScore);
        }
      }
    }

    const suspiciousStaff = Object.entries(staffAlertCounts)
      .filter(([_, count]) => count >= 5)
      .map(([name, count]) => ({
        staffName: name,
        alertCount: count,
        avgFraudScore:
          staffFraudScores[name] && staffFraudScores[name].length > 0
            ? staffFraudScores[name].reduce((sum, s) => sum + s, 0) /
              staffFraudScores[name].length
            : 0,
      }));

    // Inventory mismatch
    const stockOutQty = stockLogs
      .filter((log) => log.type === "OUT")
      .reduce((sum, log) => sum + Math.abs(log.quantity), 0);
    const mixUsageQty = mixLogs.reduce((sum, log) => sum + log.actualQty, 0);
    const inventoryMismatch =
      stockOutQty > 0
        ? ((Math.abs(stockOutQty - mixUsageQty) / stockOutQty) * 100)
        : 0;

    // 8. Staff Performance
    const staffRevenue: Record<string, number> = {};
    const staffUsage: Record<string, { qty: number; count: number }> = {};

    for (const booking of bookings) {
      if (booking.stylistId) {
        const stylist = await prisma.user.findUnique({
          where: { id: booking.stylistId },
          select: { name: true },
        });
        if (stylist) {
          const invoice = await prisma.invoice.findUnique({
            where: { bookingId: booking.id },
          });
          if (invoice) {
            staffRevenue[stylist.name] =
              (staffRevenue[stylist.name] || 0) + invoice.total;
          }
        }
      }
    }

    for (const log of mixLogs) {
      const staffName = log.staff.name;
      if (!staffUsage[staffName]) {
        staffUsage[staffName] = { qty: 0, count: 0 };
      }
      staffUsage[staffName].qty += log.actualQty;
      staffUsage[staffName].count += 1;
    }

    const staffEfficiency = Object.entries(staffUsage).map(([name, data]) => ({
      staffName: name,
      averageUsage: data.count > 0 ? data.qty / data.count : 0,
      totalUsage: data.qty,
      serviceCount: data.count,
    }));

    const topPerformers = Object.entries(staffRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, revenue]) => ({
        staffName: name,
        revenue,
        efficiency:
          staffEfficiency.find((e) => e.staffName === name)?.averageUsage || 0,
      }));

    const staffWarnings = Object.entries(staffAlertCounts)
      .filter(([_, count]) => count >= 3)
      .map(([name, count]) => ({
        staffName: name,
        alertCount: count,
        reason: "Dùng thuốc vượt chuẩn nhiều lần",
      }));

    // AI Recommendations
    const reportData = {
      month: reportMonth,
      year: reportYear,
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth,
      },
      cost: {
        total: totalCost,
        change: costChange,
      },
      profit: {
        total: profit,
        margin,
      },
      services: {
        byCategory: servicesByCategory,
        performance: serviceProfit,
        trends: serviceTrends,
      },
      products: {
        usage: Object.values(productUsage),
        byCategory: usageByCategory,
        averagePerService: averageUsagePerService,
      },
      inventory: {
        stockIn,
        stockOut,
        endingStock,
        excessStock,
        lowStockItems,
      },
      loss: {
        averageRate: averageLossRate,
        change: lossChange,
        highLossProducts,
        suspiciousStaff,
        inventoryMismatch,
      },
      staff: {
        topPerformers,
        efficiency: staffEfficiency,
        warnings: staffWarnings,
      },
    };

    let aiRecommendations;
    try {
      const prompt = monthlyReportRecommendationsPrompt(reportData);

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Business Strategy Advisor chuyên nghiệp cho salon. Phân tích báo cáo tháng, đưa ra đề xuất chiến lược cụ thể. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        aiRecommendations = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI recommendations error:", aiError);
    }

    // Create report
    const report = await prisma.monthlyReport.create({
      data: {
        reportMonth,
        reportYear,
        totalRevenue,
        totalCost,
        profit,
        margin: Math.round(margin * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        costChange: Math.round(costChange * 100) / 100,
        totalCustomers,
        returningCustomers,
        newCustomers,
        returnRate: Math.round(returnRate * 100) / 100,
        servicesByCategory,
        serviceRevenue,
        serviceCost,
        serviceProfit,
        serviceTrends,
        totalProductUsage: Object.values(productUsage),
        usageByCategory,
        averageUsagePerService,
        productCostByCategory: usageByCategory,
        stockIn,
        stockOut,
        endingStock,
        excessStock,
        lowStockItems,
        averageLossRate: Math.round(averageLossRate * 100) / 100,
        lossChange: Math.round(lossChange * 100) / 100,
        highLossProducts,
        suspiciousStaff,
        inventoryMismatch: Math.round(inventoryMismatch * 100) / 100,
        staffRevenue,
        staffEfficiency,
        staffWarnings,
        topPerformers,
        costOptimization: aiRecommendations?.costOptimization || [],
        inventoryOptimization: aiRecommendations?.inventoryOptimization || [],
        marketingSuggestions: aiRecommendations?.marketingSuggestions || [],
        trainingNeeds: aiRecommendations?.trainingNeeds || [],
        aiSummary: aiRecommendations?.summary || null,
      },
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("Generate monthly report error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate monthly report",
      },
      { status: 500 }
    );
  }
}

// Get monthly report
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (!month || !year) {
      return NextResponse.json(
        { error: "month and year are required" },
        { status: 400 }
      );
    }

    const report = await prisma.monthlyReport.findUnique({
      where: {
        reportMonth_reportYear: {
          reportMonth: month,
          reportYear: year,
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: "Report not found for this month",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("Get monthly report error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get monthly report",
      },
      { status: 500 }
    );
  }
}

