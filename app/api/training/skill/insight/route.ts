// ============================================
// Training Skill - AI Insight
// ============================================

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { skillInsightPrompt } from "@/core/prompts/skillInsightPrompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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

    // Get skill data (same as overview)
    const skillHistory = await prisma.skillProgress.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    const quizResults = await prisma.trainingQuizResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const simulations = await prisma.simulationSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate skill averages
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

    // Build prompt
    const prompt = skillInsightPrompt({
      skillHistory,
      skillAverages,
      quizResults: quizResults.map((q) => ({
        score: q.score,
        total: q.total,
        createdAt: q.createdAt,
      })),
      simulations: simulations.map((s) => ({
        scenario: s.scenario,
        persona: s.persona,
        score: s.score,
        createdAt: s.createdAt,
      })),
    });

    // Get AI insight
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia đào tạo stylist cấp quốc tế. Phân tích kỹ năng và đưa ra gợi ý cải thiện cụ thể, thực tế. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return insight");
    }

    // Parse JSON
    let insight;
    try {
      insight = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insight = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return NextResponse.json({
      success: true,
      insight,
      skillAverages,
    });
  } catch (err: any) {
    console.error("Get skill insight error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get skill insight",
      },
      { status: 500 }
    );
  }
}

