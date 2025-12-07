// ============================================
// Training Quiz - List Quizzes
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const lessonId = searchParams.get("lessonId");

    const where: any = {};

    if (lessonId) {
      where.lessonId = lessonId;
    } else if (moduleId) {
      where.lesson = {
        moduleId,
      };
    }

    const quizzes = await prisma.trainingQuiz.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            order: true,
            module: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
        },
        results: {
          select: {
            id: true,
            score: true,
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Latest 5 results
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      quizzes,
      total: quizzes.length,
    });
  } catch (err: any) {
    console.error("List quizzes error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list quizzes",
      },
      { status: 500 }
    );
  }
}

