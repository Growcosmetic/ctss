// ============================================
// Online CS Checklist - Get checklist
// ============================================

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Read checklist data from JSON file
const checklistData = JSON.parse(
  readFileSync(
    join(process.cwd(), "core", "data", "onlineCSChecklist.json"),
    "utf-8"
  )
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let items = checklistData;

    if (category) {
      items = checklistData.filter((item: any) => item.category === category);
    }

    // Group by category
    const grouped = items.reduce((acc: any, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      items,
      grouped,
      total: items.length,
    });
  } catch (err: any) {
    console.error("Get checklist error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get checklist",
      },
      { status: 500 }
    );
  }
}

