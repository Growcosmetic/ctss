// ============================================
// Daily Closing Report - Generate report
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { dailyReportInsightsPrompt } from "@/core/prompts/dailyReportInsightsPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { date } = await req.json();

    // Parse date (default to today)
    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if report already exists
    const existing = await prisma.dailyReport.findUnique({
      where: { reportDate },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        report: existing,
        message: "Report already exists for this date",
      });
    }

    // 1. Revenue & Services
    const invoices = await prisma.invoice.findMany({
      where: {
        date: {
          gte: reportDate,
          lt: nextDay,
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

    let totalRevenue = 0;
    let totalServices = 0;
    const servicesByCategory: Record<string, number> = {};
    const serviceCounts: Record<string, number> = {};

    for (const invoice of invoices) {
      totalRevenue += invoice.total;
      for (const item of invoice.items) {
        totalServices++;
        const category = item.service.category;
        servicesByCategory[category] =
          (servicesByCategory[category] || 0) + 1;
        serviceCounts[item.service.name] =
          (serviceCounts[item.service.name] || 0) + 1;
      }
    }

    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // 2. Product Cost (from ServiceCost or MixLog)
    const mixLogs = await prisma.mixLog.findMany({
      where: {
        createdAt: {
          gte: reportDate,
          lt: nextDay,
        },
      },
      include: {
        product: true,
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    let totalProductCost = 0;
    const productsUsed: Record<
      string,
      {
        productName: string;
        unit: string;
        quantity: number;
        cost: number;
        staffUsage: Record<string, number>;
      }
    > = {};

    for (const log of mixLogs) {
      totalProductCost += log.cost;
      const key = log.productId;

      if (!productsUsed[key]) {
        productsUsed[key] = {
          productName: log.product.name,
          unit: log.product.unit,
          quantity: 0,
          cost: 0,
          staffUsage: {},
        };
      }

      productsUsed[key].quantity += log.actualQty;
      productsUsed[key].cost += log.cost;
      productsUsed[key].staffUsage[log.staff.name] =
        (productsUsed[key].staffUsage[log.staff.name] || 0) + log.actualQty;
    }

    // Calculate profit
    const profit = totalRevenue - totalProductCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // 3. Unusual Usage (compare with average)
    const unusualUsage: any[] = [];
    for (const [productId, data] of Object.entries(productsUsed)) {
      // Get average from last 30 days
      const since = new Date(reportDate);
      since.setDate(since.getDate() - 30);

      const recentLogs = await prisma.mixLog.findMany({
        where: {
          productId,
          createdAt: {
            gte: since,
            lt: reportDate,
          },
        },
      });

      if (recentLogs.length > 0) {
        const avgDaily = recentLogs.reduce((sum, log) => sum + log.actualQty, 0) / 30;
        const todayQty = data.quantity;
        const deviation = ((todayQty - avgDaily) / avgDaily) * 100;

        if (Math.abs(deviation) > 20) {
          unusualUsage.push({
            productName: data.productName,
            unit: data.unit,
            todayQty,
            averageQty: avgDaily,
            deviation: Math.round(deviation * 100) / 100,
          });
        }
      }
    }

    // 4. Stock Changes & Low Stock
    const stockLogs = await prisma.stockLog.findMany({
      where: {
        createdAt: {
          gte: reportDate,
          lt: nextDay,
        },
      },
      include: {
        product: true,
      },
    });

    const stockChanges = stockLogs.map((log) => ({
      productName: log.product.name,
      type: log.type,
      quantity: log.quantity,
      note: log.note,
    }));

    // Get low stock items (from projections)
    const projections = await prisma.inventoryProjection.findMany({
      where: {
        status: "ACTIVE",
        needsRestock: true,
      },
      include: {
        product: true,
      },
    });

    const lowStockItems = projections.slice(0, 5).map((p) => ({
      productName: p.product.name,
      unit: p.product.unit,
      currentStock: p.currentStock,
      daysUntilEmpty: p.daysUntilEmpty,
    }));

    // 5. Loss Alerts
    const lossAlerts = await prisma.lossAlert.findMany({
      where: {
        detectedAt: {
          gte: reportDate,
          lt: nextDay,
        },
        status: "OPEN",
      },
      include: {
        product: true,
        staff: true,
      },
      take: 10,
    });

    const highLossProducts: any[] = [];
    const lossByProduct: Record<string, number> = {};

    for (const alert of lossAlerts) {
      if (alert.lossRate) {
        const key = alert.product?.name || "Unknown";
        if (!lossByProduct[key] || alert.lossRate > lossByProduct[key]) {
          lossByProduct[key] = alert.lossRate;
        }
      }
    }

    for (const [productName, lossRate] of Object.entries(lossByProduct)) {
      if (lossRate > 15) {
        highLossProducts.push({
          productName,
          lossRate: Math.round(lossRate * 100) / 100,
        });
      }
    }

    const totalLoss = lossAlerts.reduce(
      (sum, alert) => sum + (alert.lossQty || 0),
      0
    );

    // 6. Staff Performance
    const staffRevenue: Record<string, number> = {};
    const staffUsage: Record<string, number> = {};

    // Revenue by staff (from invoices with bookings)
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: reportDate,
          lt: nextDay,
        },
        status: "COMPLETED",
      },
      include: {
        invoice: true,
        stylist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    for (const booking of bookings) {
      if (booking.stylist && booking.invoice) {
        staffRevenue[booking.stylist.name] =
          (staffRevenue[booking.stylist.name] || 0) + booking.invoice.total;
      }
    }

    // Usage by staff (from mix logs)
    for (const log of mixLogs) {
      staffUsage[log.staff.name] =
        (staffUsage[log.staff.name] || 0) + log.actualQty;
    }

    const topPerformers = Object.entries(staffRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));

    // Staff warnings (from loss alerts)
    const staffWarnings: any[] = [];
    const staffLossCounts: Record<string, number> = {};

    for (const alert of lossAlerts) {
      if (alert.staff) {
        staffLossCounts[alert.staff.name] =
          (staffLossCounts[alert.staff.name] || 0) + 1;
      }
    }

    for (const [staffName, count] of Object.entries(staffLossCounts)) {
      if (count >= 3) {
        staffWarnings.push({
          staffName,
          alertCount: count,
        });
      }
    }

    // AI Insights
    const reportData = {
      date: reportDate.toISOString().split("T")[0],
      revenue: {
        total: totalRevenue,
        cost: totalProductCost,
        profit,
        margin: Math.round(margin * 100) / 100,
      },
      services: {
        total: totalServices,
        byCategory: servicesByCategory,
        topServices,
      },
      products: {
        totalCost: totalProductCost,
        unusualUsage,
      },
      inventory: {
        lowStockItems,
        stockChanges: stockChanges.length,
      },
      loss: {
        alertsCount: lossAlerts.length,
        highLossProducts,
        totalLoss,
      },
      staff: {
        topPerformers,
        staffWarnings,
      },
    };

    let aiInsights;
    try {
      const prompt = dailyReportInsightsPrompt(reportData);

      const completion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Business Analyst chuyên nghiệp cho salon. Phân tích báo cáo cuối ngày, đưa ra insights sâu sắc, thực tế. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        aiInsights = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI insights error:", aiError);
    }

    // Create report
    const report = await prisma.dailyReport.create({
      data: {
        reportDate,
        totalRevenue,
        totalCost: totalProductCost,
        profit,
        margin: Math.round(margin * 100) / 100,
        totalServices,
        servicesByCategory: servicesByCategory,
        topServices: topServices,
        totalProductCost,
        productsUsed: Object.values(productsUsed),
        unusualUsage,
        stockChanges,
        lowStockItems,
        lossAlerts: lossAlerts.map((alert) => ({
          id: alert.id,
          product: alert.product?.name,
          staff: alert.staff?.name,
          lossRate: alert.lossRate,
          severity: alert.severity,
        })),
        highLossProducts,
        totalLoss,
        staffRevenue,
        staffUsage,
        topPerformers,
        staffWarnings,
        strengths: aiInsights?.strengths || [],
        risks: aiInsights?.risks || [],
        predictions: aiInsights?.predictions || [],
        recommendations: aiInsights?.recommendations || [],
        aiAnalysis: aiInsights?.summary || null,
      },
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("Generate daily report error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate daily report",
      },
      { status: 500 }
    );
  }
}

// Get or generate daily report
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);

    const report = await prisma.dailyReport.findUnique({
      where: { reportDate },
    });

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: "Report not found for this date. Use POST to generate.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("Get daily report error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get daily report",
      },
      { status: 500 }
    );
  }
}

