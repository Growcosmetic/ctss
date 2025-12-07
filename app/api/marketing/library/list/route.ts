// ============================================
// Content Library - List Content
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, platform, tag, style, limit = 100 } = body;

    // Build where conditions
    const whereConditions: any = {};

    if (type) {
      whereConditions.type = type;
    }

    if (platform) {
      whereConditions.platform = platform;
    }

    if (style) {
      whereConditions.style = style;
    }

    if (tag) {
      whereConditions.tags = {
        has: tag,
      };
    }

    const results = await prisma.contentLibrary.findMany({
      where: whereConditions,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
    });
  } catch (err: any) {
    console.error("Content library list error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load content" },
      { status: 500 }
    );
  }
}

// GET endpoint for simpler access
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const platform = searchParams.get("platform");
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "100");

    const whereConditions: any = {};

    if (type) whereConditions.type = type;
    if (platform) whereConditions.platform = platform;
    if (tag) whereConditions.tags = { has: tag };

    const results = await prisma.contentLibrary.findMany({
      where: whereConditions,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
    });
  } catch (err: any) {
    console.error("Content library GET error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load content" },
      { status: 500 }
    );
  }
}

