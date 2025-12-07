// ============================================
// Competitor Analysis - Analyze competitors
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      competitorName,
      location,
      servicePrices,
      services,
      activeCampaigns,
      promotions,
    } = await req.json();

    if (!competitorName) {
      return NextResponse.json(
        { error: "competitorName is required" },
        { status: 400 }
      );
    }

    // Create or update competitor analysis
    const existing = await prisma.competitorAnalysis.findFirst({
      where: {
        competitorName,
        location: location || null,
      },
    });

    let competitor;
    if (existing) {
      competitor = await prisma.competitorAnalysis.update({
        where: { id: existing.id },
        data: {
          servicePrices: servicePrices || undefined,
          services: services || undefined,
          activeCampaigns: activeCampaigns || undefined,
          promotions: promotions || undefined,
          updatedAt: new Date(),
        },
      });
    } else {
      competitor = await prisma.competitorAnalysis.create({
        data: {
          competitorName,
          location: location || null,
          servicePrices: servicePrices || null,
          services: services || null,
          activeCampaigns: activeCampaigns || null,
          promotions: promotions || null,
          strengths: null,
          weaknesses: null,
          opportunities: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      competitor,
    });
  } catch (err: any) {
    console.error("Analyze competitor error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze competitor",
      },
      { status: 500 }
    );
  }
}

// Get competitors
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const competitorName = searchParams.get("competitorName");
    const location = searchParams.get("location");

    const where: any = {};
    if (competitorName) where.competitorName = competitorName;
    if (location) where.location = location;

    const competitors = await prisma.competitorAnalysis.findMany({
      where,
      orderBy: { analyzedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      competitors,
      total: competitors.length,
    });
  } catch (err: any) {
    console.error("Get competitors error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get competitors",
      },
      { status: 500 }
    );
  }
}
