// ============================================
// Training - Get Progress
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, levelId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const where: any = { userId };
    if (levelId) where.levelId = levelId;

    const progress = await prisma.trainingProgress.findMany({
      where,
      include: {
        level: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        trainingRole: true,
        currentLevel: true,
      },
    });

    // Get certifications
    const certifications = await prisma.certification.findMany({
      where: { userId },
      include: {
        levelData: {
          include: {
            role: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      totalCompleted: progress.filter((p) => p.status === "completed").length,
      totalInProgress: progress.filter((p) => p.status === "in_progress")
        .length,
      totalNotStarted: progress.filter((p) => p.status === "not_started")
        .length,
      averageScore:
        progress
          .filter((p) => p.score !== null)
          .reduce((sum, p) => sum + (p.score || 0), 0) /
        progress.filter((p) => p.score !== null).length || 0,
    };

    return NextResponse.json({
      success: true,
      progress,
      user,
      certifications,
      stats,
    });
  } catch (err: any) {
    console.error("Get training progress error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get progress",
      },
      { status: 500 }
    );
  }
}

