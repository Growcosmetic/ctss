// ============================================
// Training Skill - Overview
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get quiz results
    const quizResults = await prisma.trainingQuizResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        quiz: {
          select: {
            id: true,
            lesson: {
              select: {
                title: true,
                module: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get simulation sessions
    const simulations = await prisma.simulationSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Get skill progress history
    const skillHistory = await prisma.skillProgress.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    // Calculate averages per skill
    const skillAverages: Record<string, number> = {
      questioning: 0,
      analysis: 0,
      suggestion: 0,
      emotion: 0,
      closing: 0,
    };

    const skillCounts: Record<string, number> = {
      questioning: 0,
      analysis: 0,
      suggestion: 0,
      emotion: 0,
      closing: 0,
    };

    skillHistory.forEach((entry) => {
      if (skillAverages.hasOwnProperty(entry.skill)) {
        skillAverages[entry.skill] += entry.score;
        skillCounts[entry.skill]++;
      }
    });

    Object.keys(skillAverages).forEach((skill) => {
      if (skillCounts[skill] > 0) {
        skillAverages[skill] = Math.round(
          skillAverages[skill] / skillCounts[skill]
        );
      }
    });

    // Calculate overall progress
    const totalScores = Object.values(skillAverages).reduce(
      (sum, score) => sum + score,
      0
    );
    const overallAverage =
      Object.values(skillCounts).some((count) => count > 0)
        ? Math.round(totalScores / 5)
        : 0;

    // Calculate trends (last 10 vs previous 10)
    const recentSkills = skillHistory.slice(-20);
    const olderSkills = skillHistory.slice(-40, -20);

    const recentAverages: Record<string, number> = {
      questioning: 0,
      analysis: 0,
      suggestion: 0,
      emotion: 0,
      closing: 0,
    };

    const olderAverages: Record<string, number> = {
      questioning: 0,
      analysis: 0,
      suggestion: 0,
      emotion: 0,
      closing: 0,
    };

    recentSkills.forEach((entry) => {
      if (recentAverages.hasOwnProperty(entry.skill)) {
        recentAverages[entry.skill] += entry.score;
      }
    });

    olderSkills.forEach((entry) => {
      if (olderAverages.hasOwnProperty(entry.skill)) {
        olderAverages[entry.skill] += entry.score;
      }
    });

    const trends: Record<string, "up" | "down" | "stable"> = {};
    Object.keys(skillAverages).forEach((skill) => {
      const recent = recentSkills.filter((s) => s.skill === skill).length;
      const older = olderSkills.filter((s) => s.skill === skill).length;

      if (recent > 0 && older > 0) {
        const recentAvg =
          recentAverages[skill] /
          recentSkills.filter((s) => s.skill === skill).length;
        const olderAvg =
          olderAverages[skill] /
          olderSkills.filter((s) => s.skill === skill).length;

        if (recentAvg > olderAvg + 0.5) {
          trends[skill] = "up";
        } else if (recentAvg < olderAvg - 0.5) {
          trends[skill] = "down";
        } else {
          trends[skill] = "stable";
        }
      } else {
        trends[skill] = "stable";
      }
    });

    // Get completion stats
    const completedQuizzes = quizResults.length;
    const completedSimulations = simulations.filter(
      (s) => s.status === "completed"
    ).length;

    return NextResponse.json({
      success: true,
      overview: {
        overallAverage,
        skillAverages,
        trends,
        completedQuizzes,
        completedSimulations,
        totalSkillsTracked: skillHistory.length,
      },
      quizResults: quizResults.map((q) => ({
        id: q.id,
        score: q.score,
        total: q.total,
        percentage: Math.round((q.score / q.total) * 100),
        createdAt: q.createdAt,
        lesson: q.quiz.lesson.title,
        module: q.quiz.lesson.module.title,
      })),
      simulations: simulations.map((s) => ({
        id: s.id,
        scenario: s.scenario,
        persona: s.persona,
        score: s.score,
        status: s.status,
        createdAt: s.createdAt,
      })),
      skillHistory: skillHistory.map((s) => ({
        id: s.id,
        skill: s.skill,
        score: s.score,
        source: s.source,
        createdAt: s.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("Get skill overview error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get skill overview",
      },
      { status: 500 }
    );
  }
}

