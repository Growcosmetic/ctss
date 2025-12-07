// ============================================
// PHASE 30F - Real-time AI Recommendation Engine
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { videoRecommendationPrompt } from "@/core/prompts/videoRecommendationPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-video/recommend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return errorResponse("Video ID is required", 400);
    }

    // Get video with all analyses
    const video = await prisma.hairAnalysisVideo.findUnique({
      where: { id: videoId },
      include: {
        movementAnalysis: true,
        elasticityAnalysis: true,
        surfaceAnalysis: true,
        damageMapping: true,
      },
    });

    if (!video) {
      return errorResponse("Video not found", 404);
    }

    // Check if recommendation already exists
    const existing = await prisma.hairVideoRecommendation.findUnique({
      where: { videoId },
    });

    if (existing) {
      return successResponse(existing);
    }

    // Ensure we have all required analyses
    if (
      !video.movementAnalysis ||
      !video.elasticityAnalysis ||
      !video.surfaceAnalysis ||
      !video.damageMapping
    ) {
      return errorResponse(
        "Please run all analyses first (movement, elasticity, surface, damage)",
        400
      );
    }

    // Generate prompt with all analyses
    const prompt = videoRecommendationPrompt(
      video.movementAnalysis,
      video.elasticityAnalysis,
      video.surfaceAnalysis,
      video.damageMapping
    );

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia tư vấn và đề xuất công thức tại Chí Tâm Hair Salon. Đưa ra khuyến nghị chính xác, an toàn, chuyên nghiệp. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2500,
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate recommendation", 500);
    }

    // Parse JSON
    let recommendationData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      recommendationData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse recommendation JSON:", parseError);
      return errorResponse("Failed to parse recommendation response", 500);
    }

    // Save recommendation
    const recommendation = await prisma.hairVideoRecommendation.create({
      data: {
        videoId,
        hairHealthScore: recommendationData.hairHealthScore || null,
        healthStatus: recommendationData.healthStatus || null,
        permHotSuitable: recommendationData.permHotSuitable || false,
        permColdSuitable: recommendationData.permColdSuitable || false,
        permAcidSuitable: recommendationData.permAcidSuitable || false,
        colorLightSuitable: recommendationData.colorLightSuitable || false,
        colorDarkSuitable: recommendationData.colorDarkSuitable || false,
        overallRisk: recommendationData.overallRisk || null,
        riskFactors: recommendationData.riskFactors || [],
        recommendedProducts: recommendationData.recommendedProducts || [],
        recommendedTechniques: recommendationData.recommendedTechniques || [],
        treatmentPlan: recommendationData.treatmentPlan || null,
        recoveryPlan: recommendationData.recoveryPlan || null,
        permFormula: recommendationData.permFormula || null,
        colorFormula: recommendationData.colorFormula || null,
        fullRecommendation: recommendationData.fullRecommendation || null,
        aiDescription: recommendationData.aiDescription || null,
        confidence: recommendationData.confidence || null,
      },
    });

    return successResponse(recommendation);
  } catch (error: any) {
    console.error("Error generating recommendation:", error);
    return errorResponse(error.message || "Failed to generate recommendation", 500);
  }
}

