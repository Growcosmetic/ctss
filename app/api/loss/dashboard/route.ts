// ============================================
// Loss Control Dashboard Data
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Top 5 products với hao hụt cao nhất
    const topLossProducts = await prisma.lossAlert.groupBy({
      by: ["productId"],
      where: {
        type: "LOSS",
        detectedAt: { gte: since },
        status: { in: ["OPEN", "REVIEWED"] },
      },
      _avg: {
        lossRate: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _avg: {
          lossRate: "desc",
        },
      },
      take: 5,
    });

    const topLossProductsWithDetails = await Promise.all(
      topLossProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
          },
        });

        return {
          product,
          averageLossRate: item._avg.lossRate || 0,
          alertCount: item._count.id,
        };
      })
    );

    // Top 5 staff dùng nhiều thuốc nhất
    const topUsageStaff = await prisma.mixLog.groupBy({
      by: ["staffId"],
      where: {
        createdAt: { gte: since },
      },
      _avg: {
        actualQty: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _avg: {
          actualQty: "desc",
        },
      },
      take: 5,
    });

    const topUsageStaffWithDetails = await Promise.all(
      topUsageStaff.map(async (item) => {
        const staff = await prisma.user.findUnique({
          where: { id: item.staffId },
          select: {
            id: true,
            name: true,
          },
        });

        // Get most used product
        const mostUsedRaw = await prisma.mixLog.groupBy({
          by: ["productId"],
          where: {
            staffId: item.staffId,
            createdAt: { gte: since },
          },
          _sum: {
            actualQty: true,
          },
        });

        // Sort and take first
        const mostUsed = mostUsedRaw
          .sort((a, b) => (b._sum.actualQty || 0) - (a._sum.actualQty || 0))
          .slice(0, 1);

        const product =
          mostUsed.length > 0
            ? await prisma.product.findUnique({
                where: { id: mostUsed[0].productId },
                select: {
                  name: true,
                  unit: true,
                },
              })
            : null;

        return {
          staff,
          averageQty: item._avg.actualQty || 0,
          serviceCount: item._count.id,
          mostUsedProduct: product,
          mostUsedQty: mostUsed[0]?._sum.actualQty || 0,
        };
      })
    );

    // Inventory vs Mix Log comparison
    const stockOut = await prisma.stockLog.aggregate({
      where: {
        type: "OUT",
        createdAt: { gte: since },
      },
      _sum: {
        quantity: true,
      },
    });

    const mixUsage = await prisma.mixLog.aggregate({
      where: {
        createdAt: { gte: since },
      },
      _sum: {
        actualQty: true,
      },
    });

    const inventoryMismatch = {
      stockOut: Math.abs(stockOut._sum.quantity || 0),
      mixUsage: mixUsage._sum.actualQty || 0,
      difference: Math.abs(stockOut._sum.quantity || 0) - (mixUsage._sum.actualQty || 0),
      mismatchPercent:
        stockOut._sum.quantity && stockOut._sum.quantity !== 0
          ? ((Math.abs(stockOut._sum.quantity || 0) - (mixUsage._sum.actualQty || 0)) /
              Math.abs(stockOut._sum.quantity || 0)) *
            100
          : 0,
    };

    // Recent alerts (last 10)
    const recentAlerts = await prisma.lossAlert.findMany({
      where: {
        detectedAt: { gte: since },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { detectedAt: "desc" },
      take: 10,
    });

    // Alert statistics
    const alertStats = {
      total: recentAlerts.length,
      bySeverity: {
        CRITICAL: recentAlerts.filter((a) => a.severity === "CRITICAL")
          .length,
        ALERT: recentAlerts.filter((a) => a.severity === "ALERT").length,
        WARNING: recentAlerts.filter((a) => a.severity === "WARNING").length,
      },
      byType: {
        LOSS: recentAlerts.filter((a) => a.type === "LOSS").length,
        FRAUD: recentAlerts.filter((a) => a.type === "FRAUD").length,
        WASTAGE: recentAlerts.filter((a) => a.type === "WASTAGE").length,
        INVENTORY_MISMATCH: recentAlerts.filter(
          (a) => a.type === "INVENTORY_MISMATCH"
        ).length,
      },
      open: recentAlerts.filter((a) => a.status === "OPEN").length,
    };

    return NextResponse.json({
      success: true,
      dashboard: {
        topLossProducts: topLossProductsWithDetails.filter((p) => p.product),
        topUsageStaff: topUsageStaffWithDetails.filter((s) => s.staff),
        inventoryMismatch,
        recentAlerts,
        alertStats,
        period: {
          days,
          startDate: since,
          endDate: new Date(),
        },
      },
    });
  } catch (err: any) {
    console.error("Dashboard data error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get dashboard data",
      },
      { status: 500 }
    );
  }
}

