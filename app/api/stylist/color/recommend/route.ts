// ============================================
// Stylist Assistant - Color Recommendation
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { colorRecommendationPrompt } from "@/core/prompts/colorRecommendationPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const {
      customerId,
      faceAnalysisId,
      hairConditionId,
      skinTone,
      skinToneLevel,
      undertone,
      eyeColor,
      personalStyle,
    } = await req.json();

    // Get face analysis if needed
    let faceAnalysis = null;
    if (faceAnalysisId) {
      faceAnalysis = await prisma.faceAnalysis.findUnique({
        where: { id: faceAnalysisId },
      });
    } else if (customerId) {
      faceAnalysis = await prisma.faceAnalysis.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    // Get hair condition
    let hairCondition = null;
    if (hairConditionId) {
      hairCondition = await prisma.hairConditionAnalysis.findUnique({
        where: { id: hairConditionId },
      });
    } else if (customerId) {
      hairCondition = await prisma.hairConditionAnalysis.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
    }

    // AI Recommendation
    const prompt = colorRecommendationPrompt({
      skinTone,
      skinToneLevel,
      undertone,
      eyeColor,
      personalStyle,
      hairCondition: hairCondition
        ? {
            damageLevel: hairCondition.damageLevel,
            canColor: hairCondition.canColor,
          }
        : null,
    });

    let recommendation;
    try {
      const completion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Color Recommendation Specialist chuyên nghiệp. Đề xuất màu tóc phù hợp với tone da, phong cách khách hàng. Trả về JSON hợp lệ.",
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
        recommendation = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI color recommendation error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate recommendation",
        },
        { status: 500 }
      );
    }

    // Create recommendation record
    const colorRec = await prisma.colorRecommendation.create({
      data: {
        customerId: customerId || null,
        faceAnalysisId: faceAnalysis?.id || null,
        hairConditionId: hairCondition?.id || null,
        skinTone: recommendation.skinTone || skinTone || null,
        skinToneLevel: recommendation.skinToneLevel || skinToneLevel || null,
        undertone: recommendation.undertone || undertone || null,
        eyeColor: recommendation.eyeColor || eyeColor || null,
        personalStyle: recommendation.personalStyle || personalStyle || null,
        recommendedColor: recommendation.recommendedColor || "Unknown",
        colorCategory: recommendation.colorCategory || null,
        colorCode: recommendation.colorCode || null,
        baseColor: recommendation.baseColor || null,
        technique: recommendation.technique || null,
        developer: recommendation.developer || null,
        reasons: recommendation.reasons || [],
        benefits: recommendation.benefits || [],
        warnings: recommendation.warnings || [],
        alternatives: recommendation.alternatives || null,
        confidence: recommendation.confidence || 70,
        matchScore: recommendation.matchScore || 80,
      },
    });

    return NextResponse.json({
      success: true,
      recommendation: colorRec,
      aiData: recommendation,
    });
  } catch (err: any) {
    console.error("Recommend color error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to recommend color",
      },
      { status: 500 }
    );
  }
}

// Get color recommendations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const recommendations = await prisma.colorRecommendation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (err: any) {
    console.error("Get color recommendations error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get recommendations",
      },
      { status: 500 }
    );
  }
}

