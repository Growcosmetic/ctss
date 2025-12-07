// ============================================
// Training - Create Exercise
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { lessonId, type, title, content, answer, points } = await req.json();

    if (!lessonId || !type || !title || !content) {
      return NextResponse.json(
        { error: "lessonId, type, title, and content are required" },
        { status: 400 }
      );
    }

    const exercise = await prisma.trainingExercise.create({
      data: {
        lessonId,
        type, // quiz | case_study | practical | video_voice | roleplay
        title,
        content, // JSON content
        answer: answer || null,
        points: points || 10,
      },
    });

    return NextResponse.json({
      success: true,
      exercise,
    });
  } catch (err: any) {
    console.error("Create exercise error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create exercise",
      },
      { status: 500 }
    );
  }
}

