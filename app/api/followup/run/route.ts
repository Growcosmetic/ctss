// ============================================
// Follow-up Cron Job API
// Run this daily to process and send follow-ups
// ============================================

import { NextResponse } from "next/server";
import { processFollowUps } from "@/core/followup/followUpEngine";

export async function GET(req: Request) {
  try {
    // Optional: Add authentication/authorization here
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const result = await processFollowUps();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Follow-up cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process follow-ups",
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual trigger (optional)
export async function POST(req: Request) {
  try {
    const result = await processFollowUps();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Follow-up manual trigger error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process follow-ups",
      },
      { status: 500 }
    );
  }
}

