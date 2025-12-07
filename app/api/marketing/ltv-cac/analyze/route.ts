// ============================================
// Marketing LTV vs CAC - Analyze
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Get channel data
    const dataPoints = await prisma.marketingDataPoint.findMany({
      where,
      include: {
        channel: true,
      },
      orderBy: { date: "desc" },
    });

    // Get customers from channels
    const customers = await prisma.customer.findMany({
      include: {
        behavior: true,
        invoices: {
          orderBy: { date: "desc" },
        },
      },
    });

    // Calculate LTV by channel (simplified - match by source)
    const channelAnalysis: Record<
      string,
      {
        channelName: string;
        totalCustomers: number;
        totalCAC: number;
        totalLTV: number;
        averageCAC: number;
        averageLTV: number;
        ltvCacRatio: number;
        profit: number;
      }
    > = {};

    // Group by channel
    for (const dp of dataPoints) {
      const channelName = dp.channel.name;
      if (!channelAnalysis[channelName]) {
        channelAnalysis[channelName] = {
          channelName,
          totalCustomers: 0,
          totalCAC: 0,
          totalLTV: 0,
          averageCAC: 0,
          averageLTV: 0,
          ltvCacRatio: 0,
          profit: 0,
        };
      }

      channelAnalysis[channelName].totalCustomers += dp.arrivals;
      if (dp.costPerCustomer) {
        channelAnalysis[channelName].totalCAC +=
          dp.costPerCustomer * dp.arrivals;
      }
    }

    // Calculate LTV for each channel (simplified)
    // In production, you'd match customers to channels via source tracking
    for (const customer of customers) {
      if (customer.behavior) {
        const ltv = customer.behavior.lifetimeValue || 0;
        // Distribute to channels (simplified - in production use actual source)
        for (const channelName in channelAnalysis) {
          channelAnalysis[channelName].totalLTV += ltv / Object.keys(channelAnalysis).length;
        }
      }
    }

    // Calculate averages and ratios
    for (const channelName in channelAnalysis) {
      const analysis = channelAnalysis[channelName];
      analysis.averageCAC =
        analysis.totalCustomers > 0
          ? analysis.totalCAC / analysis.totalCustomers
          : 0;
      analysis.averageLTV =
        analysis.totalCustomers > 0
          ? analysis.totalLTV / analysis.totalCustomers
          : 0;
      analysis.ltvCacRatio =
        analysis.averageCAC > 0
          ? analysis.averageLTV / analysis.averageCAC
          : 0;
      analysis.profit = analysis.totalLTV - analysis.totalCAC;
    }

    // Overall summary
    const overall = {
      totalChannels: Object.keys(channelAnalysis).length,
      totalCustomers: Object.values(channelAnalysis).reduce(
        (sum, a) => sum + a.totalCustomers,
        0
      ),
      totalCAC: Object.values(channelAnalysis).reduce(
        (sum, a) => sum + a.totalCAC,
        0
      ),
      totalLTV: Object.values(channelAnalysis).reduce(
        (sum, a) => sum + a.totalLTV,
        0
      ),
      averageLTVCACRatio:
        Object.values(channelAnalysis).reduce(
          (sum, a) => sum + a.ltvCacRatio,
          0
        ) / Object.keys(channelAnalysis).length,
    };

    return NextResponse.json({
      success: true,
      channels: Object.values(channelAnalysis),
      overall,
    });
  } catch (err: any) {
    console.error("Analyze LTV/CAC error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze LTV/CAC",
      },
      { status: 500 }
    );
  }
}

