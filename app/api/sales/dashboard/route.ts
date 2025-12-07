// ============================================
// Sales Dashboard - Get sales metrics
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
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    // Get upsale records
    const upsaleRecords = await prisma.upsaleRecord.findMany({
      where: dateFilter,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate upsale metrics
    const upsaleStats = {
      totalUpsales: upsaleRecords.length,
      totalOriginalAmount: upsaleRecords.reduce((sum, r) => sum + r.originalAmount, 0),
      totalUpsaleAmount: upsaleRecords.reduce((sum, r) => sum + r.upsaleAmount, 0),
      totalAmount: upsaleRecords.reduce((sum, r) => sum + r.totalAmount, 0),
      averageUpsaleRate:
        upsaleRecords.length > 0
          ? upsaleRecords.reduce((sum, r) => sum + (r.upsaleRate || 0), 0) /
            upsaleRecords.length
          : 0,
      averageUpsaleAmount:
        upsaleRecords.length > 0
          ? upsaleRecords.reduce((sum, r) => sum + r.upsaleAmount, 0) /
            upsaleRecords.length
          : 0,
    };

    // Get upsale by staff
    const staffUpsales: Record<
      string,
      {
        staffId: string;
        count: number;
        totalUpsale: number;
        averageRate: number;
      }
    > = {};

    for (const record of upsaleRecords) {
      const staffId = record.staffId || "unknown";
      if (!staffUpsales[staffId]) {
        staffUpsales[staffId] = {
          staffId,
          count: 0,
          totalUpsale: 0,
          averageRate: 0,
        };
      }
      staffUpsales[staffId].count++;
      staffUpsales[staffId].totalUpsale += record.upsaleAmount;
    }

    for (const staffId in staffUpsales) {
      const staff = staffUpsales[staffId];
      staff.averageRate = staff.totalUpsale / staff.count;
    }

    // Get top products/services upsold
    const productCounts: Record<string, number> = {};
    const serviceCounts: Record<string, number> = {};

    for (const record of upsaleRecords) {
      for (const item of record.upsaleItems) {
        // Assuming item format is "service:xxx" or "product:xxx"
        if (item.startsWith("service:")) {
          const serviceId = item.split(":")[1];
          serviceCounts[serviceId] = (serviceCounts[serviceId] || 0) + 1;
        } else {
          productCounts[item] = (productCounts[item] || 0) + 1;
        }
      }
    }

    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count }));

    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count }));

    // Get funnel statistics
    const funnels = await prisma.salesFunnel.findMany({
      where: dateFilter,
    });

    const funnelStats = {
      total: funnels.length,
      byStage: {} as Record<string, number>,
    };

    for (const funnel of funnels) {
      funnelStats.byStage[funnel.funnelStage] =
        (funnelStats.byStage[funnel.funnelStage] || 0) + 1;
    }

    // Get abandoned carts
    const abandoned = await prisma.abandonedCart.findMany({
      where: {
        status: "ABANDONED",
        ...dateFilter,
      },
    });

    const abandonedStats = {
      total: abandoned.length,
      byType: {} as Record<string, number>,
      recoveryRate: 0,
    };

    const recovered = await prisma.abandonedCart.count({
      where: {
        status: "RECOVERED",
        ...dateFilter,
      },
    });

    for (const cart of abandoned) {
      abandonedStats.byType[cart.abandonmentType] =
        (abandonedStats.byType[cart.abandonmentType] || 0) + 1;
    }

    const totalAbandoned = abandoned.length + recovered;
    abandonedStats.recoveryRate =
      totalAbandoned > 0 ? (recovered / totalAbandoned) * 100 : 0;

    // Get recommendations
    const recommendations = await prisma.upsaleRecommendation.findMany({
      where: {
        ...dateFilter,
      },
    });

    const recommendationStats = {
      total: recommendations.length,
      pending: recommendations.filter((r) => r.status === "PENDING").length,
      accepted: recommendations.filter((r) => r.status === "ACCEPTED").length,
      sold: recommendations.filter((r) => r.status === "SOLD").length,
      rejected: recommendations.filter((r) => r.status === "REJECTED").length,
      conversionRate:
        recommendations.length > 0
          ? (recommendations.filter((r) => r.status === "SOLD").length /
              recommendations.length) *
            100
          : 0,
    };

    // Calculate AOV (Average Order Value)
    // Assuming we can get from invoices
    const aov = upsaleStats.totalAmount / Math.max(1, upsaleRecords.length);

    return NextResponse.json({
      success: true,
      dashboard: {
        upsale: upsaleStats,
        staffPerformance: Object.values(staffUpsales),
        topProducts,
        topServices,
        funnel: funnelStats,
        abandoned: abandonedStats,
        recommendations: recommendationStats,
        aov: Math.round(aov * 100) / 100,
      },
    });
  } catch (err: any) {
    console.error("Get sales dashboard error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get sales dashboard",
      },
      { status: 500 }
    );
  }
}

