// ============================================
// Stylist Troubleshooting - Get troubleshooting guides
// ============================================

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Read troubleshooting data from JSON file
const troubleshootingData = JSON.parse(
  readFileSync(
    join(process.cwd(), "core", "data", "stylistTroubleshooting.json"),
    "utf-8"
  )
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Get specific troubleshooting guide
      const guide = troubleshootingData.find((g: any) => g.id === id);
      if (!guide) {
        return NextResponse.json(
          { error: "Troubleshooting guide not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        guide,
      });
    }

    // Return all guides
    return NextResponse.json({
      success: true,
      guides: troubleshootingData,
      total: troubleshootingData.length,
    });
  } catch (err: any) {
    console.error("Get troubleshooting error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get troubleshooting guides",
      },
      { status: 500 }
    );
  }
}

