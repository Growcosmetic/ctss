// ============================================
// Training - Check Promotion Eligibility
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPromotionCriteria } from "@/core/certification/promotionCriteria";

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

    // Get staff info
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        name: true,
        trainingRole: true,
        currentLevel: true,
      },
    });

    if (!staff || !staff.trainingRole || !staff.currentLevel) {
      return NextResponse.json(
        { error: "Staff not found or missing training info" },
        { status: 404 }
      );
    }

    // Get promotion criteria for next level
    const criteria = getPromotionCriteria(
      staff.trainingRole,
      staff.currentLevel
    );

    if (!criteria) {
      return NextResponse.json({
        success: true,
        eligible: false,
        reason: "Đã đạt level cao nhất",
        criteria: null,
        status: {},
      });
    }

    // Get assessments
    const assessments = await prisma.skillAssessment.findMany({
      where: { staffId },
      orderBy: { createdAt: "desc" },
    });

    // Get roleplays
    const roleplays = await prisma.roleplaySession.findMany({
      where: {
        userId: staffId,
        status: "completed",
        score: { not: null },
      },
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

    // Get modules
    const totalModules = await prisma.trainingModule.count({
      where: {
        role: staff.trainingRole,
        level: { lte: staff.currentLevel + 1 },
      },
    });

    const completedModules = progress.filter((p) => p.status === "completed");
    const moduleCompletionRate =
      totalModules > 0
        ? Math.round((completedModules.length / totalModules) * 100)
        : 0;

    // Calculate average roleplay score
    const completedRoleplays = roleplays.filter((r) => r.score !== null);
    const averageRoleplayScore =
      completedRoleplays.length > 0
        ? Math.round(
            completedRoleplays.reduce((sum, r) => sum + (r.score || 0), 0) /
              completedRoleplays.length
          )
        : 0;

    // Check minimum roleplay score (last 3)
    const last3Roleplays = completedRoleplays.slice(0, 3);
    const minRoleplayScore =
      last3Roleplays.length > 0
        ? Math.min(...last3Roleplays.map((r) => r.score || 0))
        : 0;

    // Check specific roleplays
    const specificRoleplayChecks: any[] = [];
    if (criteria.requirements.specificRoleplays) {
      for (const req of criteria.requirements.specificRoleplays) {
        const matchingRoleplays = roleplays.filter((r) => {
          const scenario = (r.scenario || "").toLowerCase();
          const type = req.type.replace("khach_", "").replace("_", " ");
          return scenario.includes(type) && (r.score || 0) >= req.minScore;
        });
        specificRoleplayChecks.push({
          type: req.type,
          required: req.minScore,
          passed: matchingRoleplays.length > 0,
          actualScore: matchingRoleplays[0]?.score || 0,
        });
      }
    }

    // Check skill scores
    const latestAssessment = assessments[0];
    const skillScores = {
      communication: latestAssessment?.communication || 0,
      technical: latestAssessment?.technical || 0,
      problemSolving: latestAssessment?.problemSolving || 0,
      customerExperience: latestAssessment?.customerExperience || 0,
      upsale: latestAssessment?.upsale || 0,
    };

    const minSkillScore = Math.min(
      skillScores.communication,
      skillScores.technical,
      skillScores.problemSolving,
      skillScores.customerExperience,
      skillScores.upsale
    );

    // Check specific modules
    const specificModuleChecks: any[] = [];
    if (criteria.requirements.specificModules) {
      for (const moduleTitle of criteria.requirements.specificModules) {
        const completed = completedModules.some(
          (p) => p.lesson?.module?.title === moduleTitle
        );
        specificModuleChecks.push({
          module: moduleTitle,
          completed,
        });
      }
    }

    // Check technical score (for Stylist Level 4)
    const technicalScoreCheck =
      !criteria.requirements.minTechnicalScore ||
      skillScores.technical >= criteria.requirements.minTechnicalScore;

    // Check SOP violations (placeholder - would need OperationLog integration)
    const sopViolationCheck = true; // TODO: Implement actual check

    // Evaluate eligibility
    const status = {
      moduleCompletionRate: {
        required: criteria.requirements.moduleCompletionRate,
        actual: moduleCompletionRate,
        passed: moduleCompletionRate >= criteria.requirements.moduleCompletionRate,
      },
      averageRoleplayScore: {
        required: criteria.requirements.averageRoleplayScore,
        actual: averageRoleplayScore,
        passed:
          averageRoleplayScore >= criteria.requirements.averageRoleplayScore,
      },
      minRoleplayCount: {
        required: criteria.requirements.minRoleplayCount,
        actual: completedRoleplays.length,
        passed: completedRoleplays.length >= criteria.requirements.minRoleplayCount,
      },
      minRoleplayScore: {
        required: criteria.requirements.minRoleplayScore,
        actual: minRoleplayScore,
        passed: minRoleplayScore >= criteria.requirements.minRoleplayScore,
      },
      minSkillScore: {
        required: criteria.requirements.minSkillScore,
        actual: minSkillScore,
        passed: minSkillScore >= criteria.requirements.minSkillScore,
      },
      specificRoleplays: specificRoleplayChecks,
      specificModules: specificModuleChecks,
      technicalScore: technicalScoreCheck,
      sopViolations: sopViolationCheck,
    };

    const allPassed =
      status.moduleCompletionRate.passed &&
      status.averageRoleplayScore.passed &&
      status.minRoleplayCount.passed &&
      status.minRoleplayScore.passed &&
      status.minSkillScore.passed &&
      status.technicalScore &&
      status.sopViolations &&
      status.specificRoleplays.every((r) => r.passed) &&
      status.specificModules.every((m) => m.completed);

    return NextResponse.json({
      success: true,
      eligible: allPassed,
      criteria: {
        level: criteria.level,
        name: criteria.name,
        requirements: criteria.requirements,
      },
      status,
      nextLevel: allPassed ? criteria.level : null,
    });
  } catch (err: any) {
    console.error("Check promotion error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to check promotion",
      },
      { status: 500 }
    );
  }
}

