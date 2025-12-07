// ============================================
// Training - Create Lesson
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { moduleId, title, content, order, role, level } = await req.json();

    if (!moduleId || !title || order === undefined) {
      return NextResponse.json(
        { error: "moduleId, title, and order are required" },
        { status: 400 }
      );
    }

    const lesson = await prisma.trainingLesson.create({
      data: {
        moduleId,
        title,
        content: content || null,
        order,
        role: role || null,
        level: level || null,
      },
    });

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (err: any) {
    console.error("Create lesson error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create lesson",
      },
      { status: 500 }
    );
  }
}

