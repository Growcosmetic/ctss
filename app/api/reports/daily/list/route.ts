// ============================================
// Daily Report - List reports
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30");
    const offset = parseInt(searchParams.get("offset") || "0");

    const reports = await prisma.dailyReport.findMany({
      orderBy: { reportDate: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        reportDate: true,
        totalRevenue: true,
        totalCost: true,
        profit: true,
        margin: true,
        totalServices: true,
        generatedAt: true,
        emailSent: true,
        zaloSent: true,
      },
    });

    const total = await prisma.dailyReport.count();

    return NextResponse.json({
      success: true,
      reports,
      total,
      limit,
      offset,
    });
  } catch (err: any) {
    console.error("List daily reports error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list daily reports",
      },
      { status: 500 }
    );
  }
}

