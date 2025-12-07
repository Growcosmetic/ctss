// ============================================
// Content Library - Add Content
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, topic, content, cta, platform, style, tags } = body;

    // Validation
    if (!type) {
      return NextResponse.json(
        { error: "Type is required" },
        { status: 400 }
      );
    }

    // Normalize tags
    const normalizedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];

    const saved = await prisma.contentLibrary.create({
      data: {
        type,
        topic: topic || null,
        content: content || null,
        cta: cta || null,
        platform: platform || null,
        style: style || null,
        tags: normalizedTags,
      },
    });

    return NextResponse.json({
      success: true,
      content: saved,
    });
  } catch (err: any) {
    console.error("Content library add error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save content" },
      { status: 500 }
    );
  }
}

