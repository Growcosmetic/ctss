// ============================================
// Marketing Trend - Analyze trends
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { trendType, title, description, season, source } = await req.json();

    if (!trendType || !title) {
      return NextResponse.json(
        { error: "trendType and title are required" },
        { status: 400 }
      );
    }

    // Create trend record
    const trend = await prisma.marketingTrend.create({
      data: {
        trendType,
        title,
        description: description || null,
        popularity: null, // Can be calculated later
        season: season || null,
        source: source || null,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });

    return NextResponse.json({
      success: true,
      trend,
    });
  } catch (err: any) {
    console.error("Create trend error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create trend",
      },
      { status: 500 }
    );
  }
}

// Get trends
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trendType = searchParams.get("trendType");
    const active = searchParams.get("active") !== "false";

    const where: any = {};
    if (trendType) where.trendType = trendType;
    if (active) {
      where.expiresAt = {
        gte: new Date(),
      };
    }

    const trends = await prisma.marketingTrend.findMany({
      where,
      orderBy: { detectedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      trends,
      total: trends.length,
    });
  } catch (err: any) {
    console.error("Get trends error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get trends",
      },
      { status: 500 }
    );
  }
}

