// ============================================
// Training - Skill Assessment (AI chấm điểm)
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { skillAssessmentPrompt } from "@/core/prompts/skillAssessmentPrompt";
import { weaknessAnalysisPrompt } from "@/core/prompts/weaknessAnalysisPrompt";
import { trainingRecommendationPrompt } from "@/core/prompts/trainingRecommendationPrompt";
import {
  calculateTotalScore,
  getSkillLevel,
  detectWeakSkills,
} from "@/core/skills/scoreCalculator";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const {
      staffId,
      source,
      sourceId,
      scenarioType,
      conversation,
      role,
    } = await req.json();

    if (!staffId || !source || !conversation) {
      return NextResponse.json(
        { error: "staffId, source, and conversation are required" },
        { status: 400 }
      );
    }

    // AI Skill Assessment
    const prompt = skillAssessmentPrompt(conversation, role || "STYLIST", scenarioType);

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia đào tạo của Chí Tâm Hair Salon. Chấm điểm chính xác, khách quan. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return assessment");
    }

    let assessment;
    try {
      assessment = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        assessment = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI assessment");
      }
    }

    // Calculate total score and level
    const skillScores = {
      communication: assessment.communication || 0,
      technical: assessment.technical || 0,
      problemSolving: assessment.problemSolving || 0,
      customerExperience: assessment.customerExperience || 0,
      upsale: assessment.upsale || 0,
    };

    const totalScore = calculateTotalScore(skillScores);
    const level = getSkillLevel(totalScore);
    const weakSkills = detectWeakSkills(skillScores);

    // Weakness Analysis
    let weaknessAnalysis = null;
    try {
      const weaknessPrompt = weaknessAnalysisPrompt(skillScores, conversation);
      const weaknessCompletion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là chuyên gia phân tích năng lực. Phân tích điểm yếu chính xác.",
          },
          {
            role: "user",
            content: weaknessPrompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const weaknessOutput = weaknessCompletion.choices[0]?.message?.content;
      if (weaknessOutput) {
        try {
          weaknessAnalysis = JSON.parse(weaknessOutput);
        } catch {
          const jsonMatch = weaknessOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            weaknessAnalysis = JSON.parse(jsonMatch[0]);
          }
        }
      }
    } catch (err) {
      console.error("Weakness analysis error:", err);
      // Continue without weakness analysis
    }

    // Training Recommendations
    let recommendations = null;
    if (weakSkills.length > 0) {
      try {
        // Get assessment history
        const history = await prisma.skillAssessment.findMany({
          where: { staffId },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        // Get available modules
        const modules = await prisma.trainingModule.findMany({
          take: 20,
          select: { id: true, title: true, category: true },
        });

        const recPrompt = trainingRecommendationPrompt(
          weakSkills,
          history,
          modules
        );

        const recCompletion = await getClient().chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Bạn là AI Training Advisor. Đề xuất lộ trình đào tạo cá nhân hóa.",
            },
            {
              role: "user",
              content: recPrompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.8,
          response_format: { type: "json_object" },
        });

        const recOutput = recCompletion.choices[0]?.message?.content;
        if (recOutput) {
          try {
            recommendations = JSON.parse(recOutput);
          } catch {
            const jsonMatch = recOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              recommendations = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (err) {
        console.error("Training recommendation error:", err);
        // Continue without recommendations
      }
    }

    // Create Skill Assessment
    const skillAssessment = await prisma.skillAssessment.create({
      data: {
        staffId,
        source,
        sourceId: sourceId || null,
        scenarioType: scenarioType || null,
        communication: skillScores.communication,
        technical: skillScores.technical,
        problemSolving: skillScores.problemSolving,
        customerExperience: skillScores.customerExperience,
        upsale: skillScores.upsale,
        totalScore,
        level,
        strengths: assessment.strengths || [],
        improvements: assessment.improvements || [],
        detailedFeedback: assessment.detailedFeedback || null,
        weaknessAnalysis: weaknessAnalysis,
        recommendations: recommendations,
        assessedBy: "AI",
      },
    });

    // Update roleplay session if source is roleplay
    if (source === "roleplay" && sourceId) {
      await prisma.roleplaySession.update({
        where: { id: sourceId },
        data: {
          skillAssessmentId: skillAssessment.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      assessment: skillAssessment,
    });
  } catch (err: any) {
    console.error("Skill assessment error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to assess skills",
      },
      { status: 500 }
    );
  }
}

