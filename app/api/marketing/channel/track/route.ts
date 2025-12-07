// ============================================
// Marketing Channel - Track data points
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      channelName,
      date,
      leads,
      bookings,
      arrivals,
      conversions,
      adSpend,
      totalCost,
      revenue,
    } = await req.json();

    if (!channelName || !date) {
      return NextResponse.json(
        { error: "channelName and date are required" },
        { status: 400 }
      );
    }

    // Get or create channel
    let channel = await prisma.marketingChannel.findUnique({
      where: { name: channelName },
    });

    if (!channel) {
      channel = await prisma.marketingChannel.create({
        data: {
          name: channelName,
          type: channelName.includes("Ads") || channelName.includes("Paid")
            ? "PAID"
            : channelName === "Referral"
            ? "REFERRAL"
            : "ORGANIC",
        },
      });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Calculate metrics
    const costPerLead = leads > 0 ? (adSpend || totalCost) / leads : null;
    const costPerCustomer = arrivals > 0 ? (adSpend || totalCost) / arrivals : null;
    const conversionRate = leads > 0 ? (conversions / leads) * 100 : null;

    // Upsert data point
    const dataPoint = await prisma.marketingDataPoint.upsert({
      where: {
        channelId_date: {
          channelId: channel.id,
          date: targetDate,
        },
      },
      create: {
        channelId: channel.id,
        date: targetDate,
        leads: leads || 0,
        bookings: bookings || 0,
        arrivals: arrivals || 0,
        conversions: conversions || 0,
        adSpend: adSpend || 0,
        totalCost: totalCost || adSpend || 0,
        revenue: revenue || 0,
        costPerLead: costPerLead ? Math.round(costPerLead * 100) / 100 : null,
        costPerCustomer: costPerCustomer
          ? Math.round(costPerCustomer * 100) / 100
          : null,
        conversionRate: conversionRate
          ? Math.round(conversionRate * 100) / 100
          : null,
      },
      update: {
        leads: leads || undefined,
        bookings: bookings || undefined,
        arrivals: arrivals || undefined,
        conversions: conversions || undefined,
        adSpend: adSpend || undefined,
        totalCost: totalCost || adSpend || undefined,
        revenue: revenue || undefined,
        costPerLead: costPerLead ? Math.round(costPerLead * 100) / 100 : undefined,
        costPerCustomer: costPerCustomer
          ? Math.round(costPerCustomer * 100) / 100
          : undefined,
        conversionRate: conversionRate
          ? Math.round(conversionRate * 100) / 100
          : undefined,
      },
      include: {
        channel: true,
      },
    });

    return NextResponse.json({
      success: true,
      dataPoint,
    });
  } catch (err: any) {
    console.error("Track channel data error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to track channel data",
      },
      { status: 500 }
    );
  }
}

// Get channel data
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (channelId) where.channelId = channelId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const dataPoints = await prisma.marketingDataPoint.findMany({
      where,
      include: {
        channel: true,
      },
      orderBy: { date: "desc" },
    });

    // Calculate totals
    const totals = {
      leads: 0,
      bookings: 0,
      arrivals: 0,
      conversions: 0,
      adSpend: 0,
      totalCost: 0,
      revenue: 0,
    };

    for (const dp of dataPoints) {
      totals.leads += dp.leads;
      totals.bookings += dp.bookings;
      totals.arrivals += dp.arrivals;
      totals.conversions += dp.conversions;
      totals.adSpend += dp.adSpend;
      totals.totalCost += dp.totalCost;
      totals.revenue += dp.revenue;
    }

    const avgCostPerLead =
      totals.leads > 0 ? totals.totalCost / totals.leads : 0;
    const avgCostPerCustomer =
      totals.arrivals > 0 ? totals.totalCost / totals.arrivals : 0;
    const avgConversionRate =
      totals.leads > 0 ? (totals.conversions / totals.leads) * 100 : 0;

    return NextResponse.json({
      success: true,
      dataPoints,
      totals,
      averages: {
        costPerLead: Math.round(avgCostPerLead * 100) / 100,
        costPerCustomer: Math.round(avgCostPerCustomer * 100) / 100,
        conversionRate: Math.round(avgConversionRate * 100) / 100,
      },
    });
  } catch (err: any) {
    console.error("Get channel data error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get channel data",
      },
      { status: 500 }
    );
  }
}

