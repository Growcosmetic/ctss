// ============================================
// Training - Get Exercise Submissions
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const exerciseId = searchParams.get("exerciseId");
    const userId = searchParams.get("userId");

    const where: any = {};
    if (exerciseId) where.exerciseId = exerciseId;
    if (userId) where.userId = userId;

    const submissions = await prisma.exerciseSubmission.findMany({
      where,
      include: {
        exercise: {
          include: {
            lesson: {
              include: {
                module: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            trainingRole: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      submissions,
      total: submissions.length,
    });
  } catch (err: any) {
    console.error("Get submissions error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get submissions",
      },
      { status: 500 }
    );
  }
}

