// ============================================
// Marketing Dashboard - Get dashboard data
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.gte = new Date(startDate);
      if (endDate) dateFilter.date.lte = new Date(endDate);
    }

    // Get channel data
    const dataPoints = await prisma.marketingDataPoint.findMany({
      where: dateFilter,
      include: {
        channel: true,
      },
      orderBy: { date: "desc" },
    });

    // Group by channel
    const channelStats: Record<
      string,
      {
        channelName: string;
        leads: number;
        bookings: number;
        arrivals: number;
        conversions: number;
        adSpend: number;
        revenue: number;
        costPerLead: number;
        costPerCustomer: number;
        conversionRate: number;
      }
    > = {};

    for (const dp of dataPoints) {
      const channelName = dp.channel.name;
      if (!channelStats[channelName]) {
        channelStats[channelName] = {
          channelName,
          leads: 0,
          bookings: 0,
          arrivals: 0,
          conversions: 0,
          adSpend: 0,
          revenue: 0,
          costPerLead: 0,
          costPerCustomer: 0,
          conversionRate: 0,
        };
      }

      channelStats[channelName].leads += dp.leads;
      channelStats[channelName].bookings += dp.bookings;
      channelStats[channelName].arrivals += dp.arrivals;
      channelStats[channelName].conversions += dp.conversions;
      channelStats[channelName].adSpend += dp.adSpend;
      channelStats[channelName].revenue += dp.revenue;
    }

    // Calculate averages
    for (const channelName in channelStats) {
      const stat = channelStats[channelName];
      stat.costPerLead =
        stat.leads > 0 ? stat.adSpend / stat.leads : 0;
      stat.costPerCustomer =
        stat.arrivals > 0 ? stat.adSpend / stat.arrivals : 0;
      stat.conversionRate =
        stat.leads > 0 ? (stat.conversions / stat.leads) * 100 : 0;
    }

    // Get active campaigns
    const activeCampaigns = await prisma.marketingCampaignV2.findMany({
      where: {
        status: "ACTIVE",
        isActive: true,
      },
      include: {
        channel: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get top performing campaigns
    const topCampaigns = await prisma.marketingCampaignV2.findMany({
      where: {
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      orderBy: { roi: "desc" },
      take: 5,
      include: {
        channel: true,
      },
    });

    // Get segments
    const segments = await prisma.marketingSegment.findMany({
      orderBy: { customerCount: "desc" },
    });

    // Get recent trends
    const trends = await prisma.marketingTrend.findMany({
      where: {
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: { detectedAt: "desc" },
      take: 5,
    });

    // Calculate overall KPIs
    const totals = {
      leads: Object.values(channelStats).reduce((sum, s) => sum + s.leads, 0),
      bookings: Object.values(channelStats).reduce(
        (sum, s) => sum + s.bookings,
        0
      ),
      arrivals: Object.values(channelStats).reduce(
        (sum, s) => sum + s.arrivals,
        0
      ),
      adSpend: Object.values(channelStats).reduce(
        (sum, s) => sum + s.adSpend,
        0
      ),
      revenue: Object.values(channelStats).reduce(
        (sum, s) => sum + s.revenue,
        0
      ),
    };

    const kpis = {
      totalLeads: totals.leads,
      totalBookings: totals.bookings,
      totalCustomers: totals.arrivals,
      costPerLead: totals.leads > 0 ? totals.adSpend / totals.leads : 0,
      conversionRate:
        totals.leads > 0 ? (totals.arrivals / totals.leads) * 100 : 0,
      totalRevenue: totals.revenue,
      totalAdSpend: totals.adSpend,
      roi: totals.adSpend > 0 ? ((totals.revenue - totals.adSpend) / totals.adSpend) * 100 : 0,
    };

    return NextResponse.json({
      success: true,
      dashboard: {
        kpis,
        channels: Object.values(channelStats),
        activeCampaigns,
        topCampaigns,
        segments,
        trends,
      },
    });
  } catch (err: any) {
    console.error("Get dashboard error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get dashboard",
      },
      { status: 500 }
    );
  }
}

