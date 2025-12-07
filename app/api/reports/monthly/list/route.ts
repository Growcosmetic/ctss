// ============================================
// Monthly Report - List reports
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "12");
    const year = searchParams.get("year");

    const where: any = {};
    if (year) where.reportYear = parseInt(year);

    const reports = await prisma.monthlyReport.findMany({
      where,
      orderBy: [
        { reportYear: "desc" },
        { reportMonth: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        reportMonth: true,
        reportYear: true,
        totalRevenue: true,
        totalCost: true,
        profit: true,
        margin: true,
        revenueGrowth: true,
        generatedAt: true,
      },
    });

    const total = await prisma.monthlyReport.count({ where });

    return NextResponse.json({
      success: true,
      reports,
      total,
    });
  } catch (err: any) {
    console.error("List monthly reports error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list monthly reports",
      },
      { status: 500 }
    );
  }
}

