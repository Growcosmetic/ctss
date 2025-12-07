// ============================================
// CRM Dashboard - Get Dashboard Data
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const segment = searchParams.get("segment");
    const tag = searchParams.get("tag");

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(now.getDate() - 90);
    const oneEightyDaysAgo = new Date();
    oneEightyDaysAgo.setDate(now.getDate() - 180);

    // Date filters
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get all customers
    const allCustomers = await prisma.customer.findMany({
      include: {
        visits: {
          orderBy: { date: "desc" },
          take: 1,
        },
        tags: true,
      },
    });

    // Filter by segment/tag if provided
    let customers = allCustomers;
    if (segment || tag) {
      customers = allCustomers.filter((c) => {
        const customerTags = c.tags.map((t) => t.tag);
        if (segment) {
          // Apply segmentation logic
          if (segment === "VIP") {
            return customerTags.includes("VIP");
          }
          if (segment === "Active") {
            return customerTags.includes("Active");
          }
          if (segment === "Overdue") {
            return customerTags.includes("Overdue");
          }
          if (segment === "Lost") {
            return customerTags.includes("Lost");
          }
        }
        if (tag) {
          return customerTags.includes(tag);
        }
        return true;
      });
    }

    // Get all visits
    const allVisits = await prisma.visit.findMany({
      where: {
        date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      orderBy: { date: "desc" },
    });

    // ============================================
    // 1) CUSTOMER KPI
    // ============================================
    const newCustomers = customers.filter(
      (c) => new Date(c.createdAt) >= thirtyDaysAgo
    ).length;

    const returningCustomers = customers.filter((c) => c.totalVisits >= 2)
      .length;

    const overdueCustomers = customers.filter((c) => {
      if (c.visits.length === 0) return false;
      const lastVisit = c.visits[0];
      const daysSince =
        (now.getTime() - new Date(lastVisit.date).getTime()) /
        (1000 * 60 * 60 * 24);
      return daysSince >= 60 && daysSince <= 90;
    }).length;

    const lostCustomers = customers.filter((c) => {
      if (c.visits.length === 0) return false;
      const lastVisit = c.visits[0];
      const daysSince =
        (now.getTime() - new Date(lastVisit.date).getTime()) /
        (1000 * 60 * 60 * 24);
      return daysSince > 180;
    }).length;

    const activeCustomers = customers.filter((c) => {
      if (c.visits.length === 0) return false;
      const lastVisit = c.visits[0];
      const daysSince =
        (now.getTime() - new Date(lastVisit.date).getTime()) /
        (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;

    // Average visit interval
    const customersWithMultipleVisits = customers.filter(
      (c) => c.visits.length >= 2
    );
    let totalInterval = 0;
    let intervalCount = 0;
    customersWithMultipleVisits.forEach((c) => {
      const visits = c.visits.sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      for (let i = 0; i < visits.length - 1; i++) {
        const days =
          (new Date(visits[i].date).getTime() -
            new Date(visits[i + 1].date).getTime()) /
          (1000 * 60 * 60 * 24);
        totalInterval += days;
        intervalCount++;
      }
    });
    const avgVisitInterval =
      intervalCount > 0 ? Math.round(totalInterval / intervalCount) : 0;

    // Average Order Value (AOV)
    const totalRevenue = allVisits.reduce(
      (sum, v) => sum + (v.totalCharge || 0),
      0
    );
    const aov = customers.length > 0 ? totalRevenue / customers.length : 0;

    // ============================================
    // 2) REVENUE KPI
    // ============================================
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthVisits = allVisits.filter(
      (v) => new Date(v.date) >= thisMonth
    );
    const monthlyRevenue = thisMonthVisits.reduce(
      (sum, v) => sum + (v.totalCharge || 0),
      0
    );

    // Revenue by stylist
    const revenueByStylist: Record<string, number> = {};
    allVisits.forEach((v) => {
      if (v.stylist && v.totalCharge) {
        revenueByStylist[v.stylist] =
          (revenueByStylist[v.stylist] || 0) + v.totalCharge;
      }
    });
    const topStylists = Object.entries(revenueByStylist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));

    // Revenue by segment
    const revenueBySegment: Record<string, number> = {};
    customers.forEach((c) => {
      const customerTags = c.tags.map((t) => t.tag);
      const segment = customerTags.includes("VIP")
        ? "VIP"
        : customerTags.includes("Active")
        ? "Active"
        : customerTags.includes("Overdue")
        ? "Overdue"
        : customerTags.includes("Lost")
        ? "Lost"
        : "Other";
      const customerRevenue = allVisits
        .filter((v) => v.customerId === c.id)
        .reduce((sum, v) => sum + (v.totalCharge || 0), 0);
      revenueBySegment[segment] =
        (revenueBySegment[segment] || 0) + customerRevenue;
    });

    // ============================================
    // 3) SERVICE KPI
    // ============================================
    const serviceCount: Record<string, number> = {};
    allVisits.forEach((v) => {
      const service = v.service.toLowerCase();
      if (service.includes("uốn")) {
        serviceCount["Uốn"] = (serviceCount["Uốn"] || 0) + 1;
      }
      if (service.includes("nhuộm")) {
        serviceCount["Nhuộm"] = (serviceCount["Nhuộm"] || 0) + 1;
      }
      if (service.includes("phục hồi")) {
        serviceCount["Phục hồi"] = (serviceCount["Phục hồi"] || 0) + 1;
      }
      if (service.includes("cắt")) {
        serviceCount["Cắt"] = (serviceCount["Cắt"] || 0) + 1;
      }
    });

    const topServices = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Service cycle analysis
    const curlCustomers = customers.filter((c) =>
      c.tags.some((t) => t.tag === "Hay uốn")
    ).length;
    const colorCustomers = customers.filter((c) =>
      c.tags.some((t) => t.tag === "Hay nhuộm")
    ).length;

    // ============================================
    // 4) ENGAGEMENT KPI (placeholder - integrate with Phase 17D)
    // ============================================
    const reminders = await prisma.reminder.findMany({
      where: {
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
    });

    const sentReminders = reminders.filter((r) => r.sent).length;
    const totalReminders = reminders.length;
    const reminderOpenRate = totalReminders > 0
      ? Math.round((sentReminders / totalReminders) * 100)
      : 0;

    // ============================================
    // 5) CUSTOMER GROWTH CHART DATA
    // ============================================
    const last12Months: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthCustomers = customers.filter(
        (c) =>
          new Date(c.createdAt) >= monthDate &&
          new Date(c.createdAt) <= monthEnd
      ).length;

      const monthVisits = allVisits.filter(
        (v) => new Date(v.date) >= monthDate && new Date(v.date) <= monthEnd
      ).length;

      const monthRevenue = allVisits
        .filter(
          (v) => new Date(v.date) >= monthDate && new Date(v.date) <= monthEnd
        )
        .reduce((sum, v) => sum + (v.totalCharge || 0), 0);

      last12Months.push({
        month: monthDate.toLocaleDateString("vi-VN", {
          month: "short",
          year: "numeric",
        }),
        newCustomers: monthCustomers,
        visits: monthVisits,
        revenue: monthRevenue,
      });
    }

    // ============================================
    // 6) TOP CUSTOMERS
    // ============================================
    const topCustomers = customers
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        totalSpent: c.totalSpent || 0,
        totalVisits: c.totalVisits || 0,
        lastVisit: c.visits[0]?.date || null,
        tags: c.tags.map((t) => t.tag),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      kpi: {
        // Customer KPI
        newCustomers,
        returningCustomers,
        overdueCustomers,
        lostCustomers,
        activeCustomers,
        avgVisitInterval,
        aov: Math.round(aov),
        totalCustomers: customers.length,
        // Revenue KPI
        monthlyRevenue,
        totalRevenue,
        topStylists,
        revenueBySegment,
        // Service KPI
        topServices,
        curlCustomers,
        colorCustomers,
        // Engagement KPI
        reminderOpenRate,
        totalReminders,
        sentReminders,
      },
      charts: {
        customerGrowth: last12Months,
      },
      topCustomers,
      summary: {
        totalCustomers: customers.length,
        totalVisits: allVisits.length,
        totalRevenue,
        avgAOV: Math.round(aov),
      },
    });
  } catch (err: any) {
    console.error("CRM Dashboard error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get dashboard data",
      },
      { status: 500 }
    );
  }
}

