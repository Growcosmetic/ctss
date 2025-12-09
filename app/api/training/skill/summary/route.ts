// ============================================
// Training - Skill Summary (Tổng hợp điểm số)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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

    // Get all assessments for this staff
    const assessments = await prisma.skillAssessment.findMany({
      where: { staffId },
      orderBy: { createdAt: "desc" },
    });

    if (assessments.length === 0) {
      return NextResponse.json({
        success: true,
        summary: {
          totalAssessments: 0,
          averageScore: 0,
          currentLevel: "Not Assessed",
          skillAverages: {
            communication: 0,
            technical: 0,
            problemSolving: 0,
            customerExperience: 0,
            upsale: 0,
          },
          trends: [],
          weakSkills: [],
          recommendations: null,
        },
      });
    }

    // Calculate averages
    const skillAverages = {
      communication:
        assessments.reduce((sum, a) => sum + a.communication, 0) /
        assessments.length,
      technical:
        assessments.reduce((sum, a) => sum + a.technical, 0) /
        assessments.length,
      problemSolving:
        assessments.reduce((sum, a) => sum + a.problemSolving, 0) /
        assessments.length,
      customerExperience:
        assessments.reduce((sum, a) => sum + a.customerExperience, 0) /
        assessments.length,
      upsale:
        assessments.reduce((sum, a) => sum + a.upsale, 0) /
        assessments.length,
    };

    const averageScore =
      assessments.reduce((sum, a) => sum + a.totalScore, 0) /
      assessments.length;

    const latestAssessment = assessments[0];

    // Detect weak skills (below 14/20)
    const weakSkills: string[] = [];
    if (skillAverages.communication < 14) weakSkills.push("Communication");
    if (skillAverages.technical < 14) weakSkills.push("Technical Knowledge");
    if (skillAverages.problemSolving < 14) weakSkills.push("Problem Solving");
    if (skillAverages.customerExperience < 14)
      weakSkills.push("Customer Experience");
    if (skillAverages.upsale < 14) weakSkills.push("Upsale");

    // Get trends (last 5 assessments)
    const recentAssessments = assessments.slice(0, 5).reverse();
    const trends = recentAssessments.map((a) => ({
      date: a.createdAt.toISOString(),
      totalScore: a.totalScore,
      level: a.level,
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalAssessments: assessments.length,
        averageScore: Math.round(averageScore),
        currentLevel: latestAssessment.level,
        skillAverages: {
          communication: Math.round(skillAverages.communication * 10) / 10,
          technical: Math.round(skillAverages.technical * 10) / 10,
          problemSolving: Math.round(skillAverages.problemSolving * 10) / 10,
          customerExperience:
            Math.round(skillAverages.customerExperience * 10) / 10,
          upsale: Math.round(skillAverages.upsale * 10) / 10,
        },
        latestAssessment: {
          totalScore: latestAssessment.totalScore,
          level: latestAssessment.level,
          strengths: latestAssessment.strengths,
          improvements: latestAssessment.improvements,
          recommendations: latestAssessment.recommendations,
        },
        trends,
        weakSkills,
      },
    });
  } catch (err: any) {
    console.error("Skill summary error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get skill summary",
      },
      { status: 500 }
    );
  }
}

