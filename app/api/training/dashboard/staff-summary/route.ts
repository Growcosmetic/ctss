// ============================================
// Training - Staff Summary (KPI & Progress)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSkillLevel } from "@/core/skills/scoreCalculator";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return NextResponse.json(
        { error: "staffId is required" },
        { status: 400 }
      );
    }

    // Get assessments
    const assessments = await prisma.skillAssessment.findMany({
      where: { staffId },
      orderBy: { createdAt: "desc" },
    });

    // Get progress
    const progress = await prisma.trainingProgress.findMany({
      where: { userId: staffId },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
    });

    // Get roleplays
    const roleplays = await prisma.roleplaySession.findMany({
      where: { userId: staffId },
      orderBy: { createdAt: "desc" },
    });

    // Get certifications
    const certifications = await prisma.certification.findMany({
      where: { userId: staffId },
      include: {
        level: true,
      },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        name: true,
        trainingRole: true,
        currentLevel: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    // Calculate KPIs
    const completedModules = progress.filter((p) => p.status === "completed");
    const totalModules = await prisma.trainingModule.count({
      where: {
        role: user.trainingRole || undefined,
      },
    });

    const completionRate =
      totalModules > 0
        ? Math.round((completedModules.length / totalModules) * 100)
        : 0;

    // Average skill score
    let averageSkillScore = 0;
    if (assessments.length > 0) {
      const avg =
        assessments.reduce((sum, a) => sum + a.totalScore, 0) /
        assessments.length;
      averageSkillScore = Math.round(avg);
    }

    // Roleplay count & average
    const completedRoleplays = roleplays.filter(
      (r) => r.status === "completed" && r.score !== null
    );
    const roleplayCount = completedRoleplays.length;
    const roleplayAverage =
      roleplayCount > 0
        ? Math.round(
            completedRoleplays.reduce((sum, r) => sum + (r.score || 0), 0) /
              roleplayCount
          )
        : 0;

    // Improvement rate (compare last 2 assessments)
    let improvementRate = 0;
    if (assessments.length >= 2) {
      const lastScore = assessments[0].totalScore;
      const prevScore = assessments[1].totalScore;
      improvementRate = lastScore - prevScore;
    }

    // Skill averages
    const skillAverages = {
      communication: 0,
      technical: 0,
      problemSolving: 0,
      customerExperience: 0,
      upsale: 0,
    };

    if (assessments.length > 0) {
      skillAverages.communication =
        assessments.reduce((sum, a) => sum + a.communication, 0) /
        assessments.length;
      skillAverages.technical =
        assessments.reduce((sum, a) => sum + a.technical, 0) /
        assessments.length;
      skillAverages.problemSolving =
        assessments.reduce((sum, a) => sum + a.problemSolving, 0) /
        assessments.length;
      skillAverages.customerExperience =
        assessments.reduce((sum, a) => sum + a.customerExperience, 0) /
        assessments.length;
      skillAverages.upsale =
        assessments.reduce((sum, a) => sum + a.upsale, 0) / assessments.length;
    }

    // Detect weak skills (< 14/20)
    const weakSkills: string[] = [];
    if (skillAverages.communication < 14) weakSkills.push("Communication");
    if (skillAverages.technical < 14) weakSkills.push("Technical");
    if (skillAverages.problemSolving < 14) weakSkills.push("Problem Solving");
    if (skillAverages.customerExperience < 14)
      weakSkills.push("Customer Experience");
    if (skillAverages.upsale < 14) weakSkills.push("Upsale");

    // Current level progress
    let levelProgress = null;
    if (user.currentLevel) {
      const level = await prisma.trainingLevel.findFirst({
        where: {
          role: {
            name: user.trainingRole || "STYLIST",
          },
          level: user.currentLevel,
        },
      });

      if (level) {
        const completedInLevel = progress.filter(
          (p) =>
            p.levelId === level.id && p.status === "completed"
        );
        // Assume need to complete all modules in level to advance
        const totalInLevel = await prisma.trainingModule.count({
          where: {
            role: user.trainingRole || "STYLIST",
            level: user.currentLevel,
          },
        });

        levelProgress = {
          currentLevel: user.currentLevel,
          levelName: level.name,
          completed: completedInLevel.length,
          total: totalInLevel || 1,
          percent:
            totalInLevel > 0
              ? Math.round((completedInLevel.length / totalInLevel) * 100)
              : 0,
        };
      }
    }

    // Progress timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProgress = progress.filter(
      (p) => new Date(p.createdAt) >= thirtyDaysAgo
    );
    const recentRoleplays = roleplays.filter(
      (r) => new Date(r.createdAt) >= thirtyDaysAgo
    );

    const timeline = [
      ...recentProgress
        .filter((p) => p.status === "completed")
        .map((p) => ({
          type: "module",
          date: p.createdAt,
          title: `Hoàn thành Module: ${p.lesson?.module?.title || "Unknown"}`,
          score: p.score,
        })),
      ...recentRoleplays
        .filter((r) => r.status === "completed")
        .map((r) => ({
          type: "roleplay",
          date: r.createdAt,
          title: `Roleplay: ${r.scenario}`,
          score: r.score,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      summary: {
        staff: user,
        kpis: {
          completionRate,
          averageSkillScore,
          roleplayCount,
          roleplayAverage,
          improvementRate,
        },
        skillAverages: {
          communication: Math.round(skillAverages.communication * 10) / 10,
          technical: Math.round(skillAverages.technical * 10) / 10,
          problemSolving: Math.round(skillAverages.problemSolving * 10) / 10,
          customerExperience:
            Math.round(skillAverages.customerExperience * 10) / 10,
          upsale: Math.round(skillAverages.upsale * 10) / 10,
        },
        weakSkills,
        levelProgress,
        timeline,
        certifications: certifications.map((c) => ({
          id: c.id,
          level: c.level.name,
          role: c.level.role?.name,
          issueDate: c.issueDate,
        })),
      },
    });
  } catch (err: any) {
    console.error("Staff summary error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get staff summary",
      },
      { status: 500 }
    );
  }
}

