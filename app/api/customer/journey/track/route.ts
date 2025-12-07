// ============================================
// Customer Journey - Track journey stage
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      journeyStage,
      touchpoint,
      stageData,
      touchpointData,
      source,
      campaign,
      device,
    } = await req.json();

    if (!customerId || !journeyStage) {
      return NextResponse.json(
        { error: "customerId and journeyStage are required" },
        { status: 400 }
      );
    }

    // Validate journey stage
    const validStages = [
      "AWARENESS",
      "CONSIDERATION",
      "BOOKING",
      "SERVICE",
      "CHECKOUT",
      "POST_SERVICE",
      "RETURN",
    ];

    if (!validStages.includes(journeyStage)) {
      return NextResponse.json(
        { error: "Invalid journey stage" },
        { status: 400 }
      );
    }

    // Create journey record
    const journey = await prisma.customerJourney.create({
      data: {
        customerId,
        journeyStage,
        touchpoint,
        stageData: stageData || null,
        touchpointData: touchpointData || null,
        source: source || null,
        campaign: campaign || null,
        device: device || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      journey,
    });
  } catch (err: any) {
    console.error("Track journey error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to track journey",
      },
      { status: 500 }
    );
  }
}

// Get customer journey
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    const journeys = await prisma.customerJourney.findMany({
      where: { customerId },
      orderBy: { timestamp: "asc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Get current stage (latest)
    const currentStage = journeys.length > 0 ? journeys[journeys.length - 1] : null;

    return NextResponse.json({
      success: true,
      journeys,
      currentStage,
      totalStages: journeys.length,
    });
  } catch (err: any) {
    console.error("Get journey error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get journey",
      },
      { status: 500 }
    );
  }
}

