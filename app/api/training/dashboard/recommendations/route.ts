// ============================================
// Training - Dashboard Recommendations (AI)
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { dashboardRecommendationPrompt } from "@/core/prompts/dashboardRecommendationPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

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

    // Get assessments for summary
    const assessments = await prisma.skillAssessment.findMany({
      where: { staffId },
      orderBy: { createdAt: "desc" },
    });

    // Get user
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

    // Calculate skill averages
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
        assessments.reduce((sum, a) => sum + a.upsale, 0) /
        assessments.length;
    }

    // Detect weak skills
    const weakSkills: string[] = [];
    if (skillAverages.communication < 14) weakSkills.push("Communication");
    if (skillAverages.technical < 14) weakSkills.push("Technical");
    if (skillAverages.problemSolving < 14) weakSkills.push("Problem Solving");
    if (skillAverages.customerExperience < 14)
      weakSkills.push("Customer Experience");
    if (skillAverages.upsale < 14) weakSkills.push("Upsale");

    // Get completed modules
    const progress = await prisma.trainingProgress.findMany({
      where: {
        userId: staffId,
        status: "completed",
      },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
    });

    const completedModules = progress
      .map((p) => p.lesson?.module)
      .filter((m) => m !== null && m !== undefined);

    // Get available modules
    const availableModules = await prisma.trainingModule.findMany({
      where: {
        role: summary.staff.trainingRole || "STYLIST",
        level: summary.staff.currentLevel || 1,
      },
      include: {
        lessons: true,
      },
    });

    // Generate AI recommendations
    const prompt = dashboardRecommendationPrompt(
      {
        communication: skillAverages.communication,
        technical: skillAverages.technical,
        problemSolving: skillAverages.problemSolving,
        customerExperience: skillAverages.customerExperience,
        upsale: skillAverages.upsale,
      },
      weakSkills,
      completedModules,
      user.currentLevel || 1,
      availableModules
    );

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI Training Advisor chuyên nghiệp. Đề xuất lộ trình học tập cá nhân hóa, logic và thực tế. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return recommendations");
    }

    let recommendations;
    try {
      recommendations = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI recommendations");
      }
    }

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (err: any) {
    console.error("Dashboard recommendations error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get recommendations",
      },
      { status: 500 }
    );
  }
}

