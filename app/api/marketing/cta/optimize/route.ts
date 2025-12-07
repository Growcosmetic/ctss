// ============================================
// CTA Optimize (Single Customer)
// Quick endpoint for single CTA optimization
// ============================================

import { NextResponse } from "next/server";
import { optimizeCTA } from "@/core/cta/ctaOptimizer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, segment, goal, platform, contentType } = body;

    if (!customer || !segment || !goal || !platform) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: customer, segment, goal, platform",
        },
        { status: 400 }
      );
    }

    const optimization = await optimizeCTA({
      customer,
      segment,
      goal,
      platform,
      contentType,
    });

    return NextResponse.json({
      success: true,
      ...optimization,
    });
  } catch (error: any) {
    console.error("Single CTA optimization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to optimize CTA",
      },
      { status: 500 }
    );
  }
}

