// ============================================
// Stylist Assistant - Hairstyle Recommendation
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hairstyleRecommendationPrompt } from "@/core/prompts/hairstyleRecommendationPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { customerId, faceAnalysisId, hairConditionId, personalStyle, preferences } = await req.json();

    // Get face analysis
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
    const prompt = hairstyleRecommendationPrompt({
      faceShape: faceAnalysis?.faceShape,
      faceVibe: faceAnalysis?.overallVibe,
      hairCondition: hairCondition
        ? {
            damageLevel: hairCondition.damageLevel,
            elasticity: hairCondition.elasticity,
            thickness: hairCondition.thickness,
            canPerm: hairCondition.canPerm,
          }
        : null,
      personalStyle,
      preferences,
    });

    let recommendation;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Hairstyle Recommendation Specialist chuyên nghiệp. Đề xuất kiểu tóc phù hợp dựa trên khuôn mặt, chất tóc, phong cách. Trả về JSON hợp lệ.",
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
      if (rawOutput) {
        recommendation = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI hairstyle recommendation error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate recommendation",
        },
        { status: 500 }
      );
    }

    // Create recommendation record
    const hairstyleRec = await prisma.hairstyleRecommendation.create({
      data: {
        customerId: customerId || null,
        faceAnalysisId: faceAnalysis?.id || null,
        hairConditionId: hairCondition?.id || null,
        recommendedStyle: recommendation.recommendedStyle || "Unknown",
        styleCategory: recommendation.styleCategory || null,
        description: recommendation.description || null,
        curlSize: recommendation.curlSize || null,
        layerStyle: recommendation.layerStyle || null,
        length: recommendation.length || null,
        recommendedProduct: recommendation.recommendedProduct || null,
        permSetting: recommendation.permSetting || null,
        reasons: recommendation.reasons || [],
        benefits: recommendation.benefits || [],
        warnings: recommendation.warnings || [],
        confidence: recommendation.confidence || 70,
        matchScore: recommendation.matchScore || 80,
        faceShapeMatch: recommendation.faceShapeMatch || null,
        alternatives: recommendation.alternatives || null,
      },
    });

    return NextResponse.json({
      success: true,
      recommendation: hairstyleRec,
      aiData: recommendation,
    });
  } catch (err: any) {
    console.error("Recommend hairstyle error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to recommend hairstyle",
      },
      { status: 500 }
    );
  }
}

// Get recommendations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const recommendations = await prisma.hairstyleRecommendation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (err: any) {
    console.error("Get hairstyle recommendations error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get recommendations",
      },
      { status: 500 }
    );
  }
}

