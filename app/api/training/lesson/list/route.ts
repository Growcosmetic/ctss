// ============================================
// Training Lesson - List Lessons
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { moduleId } = body;

    const where = moduleId ? { moduleId } : {};

    const lessons = await prisma.trainingLesson.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      lessons,
      total: lessons.length,
    });
  } catch (err: any) {
    console.error("List training lessons error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list lessons" },
      { status: 500 }
    );
  }
}

