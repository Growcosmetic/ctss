// ============================================
// Consumption Tracking - Track daily usage
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Track consumption for a specific date
export async function POST(req: Request) {
  try {
    const { productId, date } = await req.json();

    if (!productId || !date) {
      return NextResponse.json(
        { error: "productId and date are required" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get mix logs for the day
    const mixLogs = await prisma.mixLog.findMany({
      where: {
        productId,
        createdAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (mixLogs.length === 0) {
      return NextResponse.json({
        success: true,
        tracked: false,
        message: "No usage for this date",
      });
    }

    // Calculate totals
    const totalQty = mixLogs.reduce((sum, log) => sum + log.actualQty, 0);
    const quantities = mixLogs.map((log) => log.actualQty);
    const peakUsage = Math.max(...quantities);
    const lowUsage = Math.min(...quantities);

    // Find top staff
    const staffUsage: Record<string, number> = {};
    mixLogs.forEach((log) => {
      staffUsage[log.staffId] =
        (staffUsage[log.staffId] || 0) + log.actualQty;
    });

    const topStaffId = Object.entries(staffUsage).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Upsert consumption tracking
    const consumption = await prisma.consumptionTracking.upsert({
      where: {
        productId_date: {
          productId,
          date: targetDate,
        },
      },
      create: {
        productId,
        date: targetDate,
        quantityUsed: totalQty,
        serviceCount: mixLogs.length,
        peakUsage,
        lowUsage,
        topStaffId: topStaffId || null,
      },
      update: {
        quantityUsed: totalQty,
        serviceCount: mixLogs.length,
        peakUsage,
        lowUsage,
        topStaffId: topStaffId || null,
      },
    });

    return NextResponse.json({
      success: true,
      tracked: true,
      consumption,
    });
  } catch (err: any) {
    console.error("Track consumption error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to track consumption",
      },
      { status: 500 }
    );
  }
}

// Get consumption statistics
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const days = parseInt(searchParams.get("days") || "30");

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    // Get consumption records
    const consumptions = await prisma.consumptionTracking.findMany({
      where: {
        productId,
        date: { gte: since },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
        topStaff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    if (consumptions.length === 0) {
      return NextResponse.json({
        success: true,
        productId,
        period: { days, startDate: since, endDate: new Date() },
        statistics: {
          averageDailyUsage: 0,
          totalUsage: 0,
          peakUsage: 0,
          lowUsage: 0,
          totalServices: 0,
          daysWithUsage: 0,
        },
        consumptions: [],
      });
    }

    // Calculate statistics
    const totalUsage = consumptions.reduce(
      (sum, c) => sum + c.quantityUsed,
      0
    );
    const averageDailyUsage = totalUsage / days;
    const peakUsage = Math.max(...consumptions.map((c) => c.peakUsage || 0));
    const lowUsage = Math.min(
      ...consumptions.map((c) => c.lowUsage || c.quantityUsed)
    );
    const totalServices = consumptions.reduce(
      (sum, c) => sum + c.serviceCount,
      0
    );
    const daysWithUsage = consumptions.length;

    // Top staff analysis
    const staffUsage: Record<string, number> = {};
    consumptions.forEach((c) => {
      if (c.topStaffId) {
        staffUsage[c.topStaffId] =
          (staffUsage[c.topStaffId] || 0) + c.quantityUsed;
      }
    });

    const topStaff = Object.entries(staffUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([staffId, qty]) => {
        const staff = consumptions.find((c) => c.topStaffId === staffId)
          ?.topStaff;
        return {
          staffId,
          staffName: staff?.name || "Unknown",
          totalUsage: qty,
        };
      });

    return NextResponse.json({
      success: true,
      productId,
      period: { days, startDate: since, endDate: new Date() },
      statistics: {
        averageDailyUsage: Math.round(averageDailyUsage * 100) / 100,
        totalUsage,
        peakUsage,
        lowUsage,
        totalServices,
        daysWithUsage,
        topStaff,
      },
      consumptions: consumptions.map((c) => ({
        date: c.date,
        quantityUsed: c.quantityUsed,
        serviceCount: c.serviceCount,
        peakUsage: c.peakUsage,
        lowUsage: c.lowUsage,
        topStaff: c.topStaff,
      })),
    });
  } catch (err: any) {
    console.error("Get consumption error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get consumption",
      },
      { status: 500 }
    );
  }
}

