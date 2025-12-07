// ============================================
// Stylist Assistant - Hair Condition Analysis
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hairConditionPrompt } from "@/core/prompts/hairConditionPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const {
      customerId,
      thickness,
      density,
      elasticity,
      damageLevel,
      porosity,
      dryness,
      chemicalHistory,
    } = await req.json();

    // AI Analysis
    const prompt = hairConditionPrompt({
      thickness,
      density,
      elasticity,
      damageLevel,
      porosity,
      dryness,
      chemicalHistory,
    });

    let analysis;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Hair Condition Analyst chuyên nghiệp. Phân tích chất tóc, đánh giá rủi ro, đưa ra khuyến nghị an toàn. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        analysis = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI hair condition analysis error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to analyze hair condition",
        },
        { status: 500 }
      );
    }

    // Find last treatment
    let lastTreatment = null;
    let lastTreatmentDate = null;
    if (chemicalHistory && chemicalHistory.length > 0) {
      const sorted = chemicalHistory.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      lastTreatment = sorted[0].type;
      lastTreatmentDate = new Date(sorted[0].date);
    }

    // Create analysis record
    const hairAnalysis = await prisma.hairConditionAnalysis.create({
      data: {
        customerId: customerId || null,
        thickness: analysis.thickness || thickness || null,
        density: analysis.density || density || null,
        elasticity: analysis.elasticity || elasticity || null,
        damageLevel: analysis.damageLevel || damageLevel || null,
        porosity: analysis.porosity || porosity || null,
        dryness: analysis.dryness || dryness || null,
        texture: analysis.texture || null,
        chemicalHistory: chemicalHistory || null,
        lastTreatment: lastTreatment,
        lastTreatmentDate: lastTreatmentDate,
        canPerm: analysis.canPerm !== undefined ? analysis.canPerm : null,
        canColor: analysis.canColor !== undefined ? analysis.canColor : null,
        riskLevel: analysis.riskLevel || null,
        recommendations: analysis.recommendations || null,
        recommendedProducts: analysis.recommendedProducts || [],
        isAIGenerated: true,
        confidence: analysis.confidence || 70,
        analysisNotes: analysis.analysis || null,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: hairAnalysis,
      aiData: analysis,
    });
  } catch (err: any) {
    console.error("Hair condition analyze error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze hair condition",
      },
      { status: 500 }
    );
  }
}

// Get hair condition analysis
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const analyses = await prisma.hairConditionAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    return NextResponse.json({
      success: true,
      analysis: analyses[0] || null,
    });
  } catch (err: any) {
    console.error("Get hair condition error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get hair condition",
      },
      { status: 500 }
    );
  }
}

