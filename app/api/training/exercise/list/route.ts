// ============================================
// Training - List Exercises
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const moduleId = searchParams.get("moduleId");
    const type = searchParams.get("type");

    const where: any = {};
    if (lessonId) {
      where.lessonId = lessonId;
    }
    if (type) {
      where.type = type;
    }
    if (moduleId) {
      // Get exercises for all lessons in module
      const lessons = await prisma.trainingLesson.findMany({
        where: { moduleId },
        select: { id: true },
      });
      where.lessonId = {
        in: lessons.map((l) => l.id),
      };
    }

    const exercises = await prisma.trainingExercise.findMany({
      where,
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      exercises,
      total: exercises.length,
    });
  } catch (err: any) {
    console.error("List exercises error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list exercises",
      },
      { status: 500 }
    );
  }
}

