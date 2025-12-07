// ============================================
// Online CS Scripts - Get messaging scripts
// ============================================

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Read scripts data from JSON file
const scriptsData = JSON.parse(
  readFileSync(
    join(process.cwd(), "core", "data", "onlineCSScripts.json"),
    "utf-8"
  )
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const situation = searchParams.get("situation");
    const platform = searchParams.get("platform");
    const id = searchParams.get("id");

    let scripts = scriptsData;

    if (id) {
      // Get specific script
      const script = scriptsData.find((s: any) => s.id === id);
      if (!script) {
        return NextResponse.json(
          { error: "Script not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        script,
      });
    }

    if (situation) {
      // Filter by situation
      scripts = scriptsData.filter(
        (s: any) => s.situation.toLowerCase().includes(situation.toLowerCase())
      );
    }

    if (platform) {
      // Filter by platform (all, zalo, facebook, instagram)
      scripts = scripts.filter(
        (s: any) => s.platform === "all" || s.platform === platform
      );
    }

    return NextResponse.json({
      success: true,
      scripts,
      total: scripts.length,
    });
  } catch (err: any) {
    console.error("Get scripts error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get scripts",
      },
      { status: 500 }
    );
  }
}

