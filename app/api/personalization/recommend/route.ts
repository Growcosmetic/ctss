// ============================================
// PHASE 31C - Personalized Style Recommendation
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { personalizedRecommendationPrompt } from "@/core/prompts/personalizedRecommendationPrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/personalization/recommend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, stylistId, recommendationType = "STYLE" } = body;

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    // Get customer profile
    const customerProfile = await prisma.customerPersonalityProfile.findUnique({
      where: { customerId },
    });

    if (!customerProfile) {
      return errorResponse("Customer profile not found. Please generate profile first.", 404);
    }

    // Get stylist signature if stylistId provided
    let stylistSignature = null;
    if (stylistId) {
      stylistSignature = await prisma.stylistSignatureStyle.findUnique({
        where: { staffId: stylistId },
      });
    }

    // Get hair condition (latest scan if available)
    const hairCondition = await prisma.hairHealthScan?.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    }).catch(() => null);

    // Generate prompt
    const prompt = personalizedRecommendationPrompt(
      customerProfile,
      stylistSignature,
      hairCondition || undefined
    );

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là MINA - trợ lý AI cá nhân hóa. Tạo gợi ý chính xác, phù hợp với gu khách và phong cách stylist. Trả về JSON hợp lệ.",
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

    // Calculate priority score (based on match scores)
    const priority = Math.floor(
      ((recommendationData.customerMatchScore || 0) * 0.6 +
       (recommendationData.stylistMatchScore || 0) * 0.4) *
        100
    );

    // Save recommendation
    const recommendation = await prisma.personalizedRecommendation.create({
      data: {
        customerId,
        stylistId: stylistId || null,
        recommendationType: recommendationType,
        priority,
        recommendedStyle: recommendationData.recommendedStyle || null,
        recommendedColor: recommendationData.recommendedColor || null,
        recommendedService: recommendationData.recommendedService || null,
        recommendedProducts: recommendationData.recommendedProducts || [],
        reasoning: recommendationData.reasoning || null,
        personalizationFactors: recommendationData.personalizationFactors || null,
        confidence: recommendationData.confidence || null,
        customerMatchScore: recommendationData.customerMatchScore || null,
        stylistMatchScore: recommendationData.stylistMatchScore || null,
        aiGenerated: true,
        fullExplanation: recommendationData.fullExplanation || null,
        presentedAt: new Date(),
      },
    });

    return successResponse(recommendation);
  } catch (error: any) {
    console.error("Error generating recommendation:", error);
    return errorResponse(error.message || "Failed to generate recommendation", 500);
  }
}

// GET /api/personalization/recommend/[customerId]
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    const recommendations = await prisma.personalizedRecommendation.findMany({
      where: {
        customerId,
        status: "ACTIVE",
      },
      orderBy: { priority: "desc" },
      take: limit,
    });

    return successResponse(recommendations);
  } catch (error: any) {
    console.error("Error fetching recommendations:", error);
    return errorResponse(error.message || "Failed to fetch recommendations", 500);
  }
}

