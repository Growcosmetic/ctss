// ============================================
// Customer Journey State API
// ============================================

import { NextResponse } from "next/server";
import { processJourneyEvent } from "@/core/customerJourney/transitionEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, event, metadata } = body;

    if (!customerId || !event) {
      return NextResponse.json(
        { error: "customerId and event are required" },
        { status: 400 }
      );
    }

    const result = await processJourneyEvent({
      customerId,
      event,
      metadata,
    });

    return NextResponse.json({
      success: result.success,
      previousState: result.previousState,
      newState: result.newState,
      error: result.error,
    });
  } catch (error: any) {
    console.error("Journey state API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process journey event" },
      { status: 500 }
    );
  }
}

