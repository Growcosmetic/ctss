// ============================================
// Training Quiz - Get Quiz
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const lessonId = searchParams.get("lessonId");

    if (!id && !lessonId) {
      return NextResponse.json(
        { error: "id or lessonId is required" },
        { status: 400 }
      );
    }

    const where = id ? { id } : { lessonId };

    const quiz = await prisma.trainingQuiz.findUnique({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            content: true,
            module: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (err: any) {
    console.error("Get quiz error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get quiz",
      },
      { status: 500 }
    );
  }
}

