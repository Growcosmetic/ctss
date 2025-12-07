// ============================================
// Training - Update Progress
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, levelId, moduleId, lessonId, status, score } =
      await req.json();

    if (!userId || !levelId) {
      return NextResponse.json(
        { error: "userId and levelId are required" },
        { status: 400 }
      );
    }

    // Find or create progress
    const existing = await prisma.trainingProgress.findFirst({
      where: {
        userId,
        levelId,
        moduleId: moduleId || null,
        lessonId: lessonId || null,
      },
    });

    let progress;
    if (existing) {
      progress = await prisma.trainingProgress.update({
        where: { id: existing.id },
        data: {
          status: status || existing.status,
          score: score !== undefined ? score : existing.score,
          completedAt:
            status === "completed" ? new Date() : existing.completedAt,
        },
      });
    } else {
      progress = await prisma.trainingProgress.create({
        data: {
          userId,
          levelId,
          moduleId: moduleId || null,
          lessonId: lessonId || null,
          status: status || "in_progress",
          score: score || null,
          completedAt: status === "completed" ? new Date() : null,
        },
      });
    }

    // Check if level requirements met for certification
    if (status === "completed" && score && score >= 80) {
      await checkAndIssueCertification(userId, levelId);
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (err: any) {
    console.error("Update training progress error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update progress",
      },
      { status: 500 }
    );
  }
}

async function checkAndIssueCertification(userId: string, levelId: string) {
  try {
    // Check if certification already exists
    const existing = await prisma.certification.findFirst({
      where: { userId, levelId },
    });

    if (existing) return;

    // Get level data
    const level = await prisma.trainingLevel.findUnique({
      where: { id: levelId },
      include: { role: true },
    });

    if (!level) return;

    // Get user progress for this level
    const allProgress = await prisma.trainingProgress.findMany({
      where: { userId, levelId, status: "completed" },
    });

    // Check if all required modules completed
    const requirements = level.requirements as any;
    if (requirements?.modules && Array.isArray(requirements.modules)) {
      // This is simplified - in production, check actual module completion
      const allModulesCompleted = allProgress.length >= requirements.modules.length;
      if (!allModulesCompleted) return;
    }

    // Issue certification
    await prisma.certification.create({
      data: {
        userId,
        levelId,
        role: level.role.name,
        level: level.level,
      },
    });

    // Update user current level
    await prisma.user.update({
      where: { id: userId },
      data: { currentLevel: level.level },
    });
  } catch (err) {
    console.error("Check certification error:", err);
  }
}

