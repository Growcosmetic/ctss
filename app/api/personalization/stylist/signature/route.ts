// ============================================
// PHASE 31B - Stylist Signature Style Learning
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { stylistSignatureLearningPrompt } from "@/core/prompts/stylistSignatureLearningPrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/personalization/stylist/signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffId } = body;

    if (!staffId) {
      return errorResponse("Staff ID is required", 400);
    }

    // Get staff data
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return errorResponse("Staff not found", 404);
    }

    // Get services performed by this stylist
    const bookings = await prisma.booking.findMany({
      where: { staffId },
      take: 50,
      orderBy: { date: "desc" },
      include: {
        service: true,
        customer: true,
      },
    });

    // Get quality scores
    const qualityScores = await prisma.qualityScore.findMany({
      where: { staffId },
      take: 20,
      orderBy: { capturedAt: "desc" },
    });

    // Get feedback
    const feedback = await prisma.feedback?.findMany({
      where: { staffId },
      take: 20,
    }).catch(() => []);

    // Prepare data
    const stylistData = {
      services: bookings.map(b => b.service).filter(Boolean),
      bookings: bookings,
      feedback: feedback || [],
      qualityScores: qualityScores,
    };

    // Generate prompt
    const prompt = stylistSignatureLearningPrompt(stylistData);

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chuyên phân tích và học phong cách stylist. Phân tích chính xác và trả về JSON hợp lệ.",
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
      return errorResponse("AI did not generate signature", 500);
    }

    // Parse JSON
    let signatureData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      signatureData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse signature JSON:", parseError);
      return errorResponse("Failed to parse signature response", 500);
    }

    // Calculate average rating
    const avgRating = qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + (score.overallScore || 0), 0) / qualityScores.length
      : null;

    // Update or create signature
    const signature = await prisma.stylistSignatureStyle.upsert({
      where: { staffId },
      update: {
        specialties: signatureData.specialties || [],
        preferredCurlSize: signatureData.preferredCurlSize || [],
        preferredColorTones: signatureData.preferredColorTones || [],
        preferredTechniques: signatureData.preferredTechniques || [],
        signatureStyle: signatureData.signatureStyle || null,
        styleStrength: signatureData.styleStrength || null,
        typicalResults: signatureData.typicalResults || null,
        commonFormulas: signatureData.commonFormulas || null,
        successfulStyles: signatureData.successfulStyles || null,
        preferredSettings: signatureData.preferredSettings || null,
        averageRating: avgRating,
        servicesCount: bookings.length,
        lastAnalyzed: new Date(),
      },
      create: {
        staffId,
        specialties: signatureData.specialties || [],
        preferredCurlSize: signatureData.preferredCurlSize || [],
        preferredColorTones: signatureData.preferredColorTones || [],
        preferredTechniques: signatureData.preferredTechniques || [],
        signatureStyle: signatureData.signatureStyle || null,
        styleStrength: signatureData.styleStrength || null,
        typicalResults: signatureData.typicalResults || null,
        commonFormulas: signatureData.commonFormulas || null,
        successfulStyles: signatureData.successfulStyles || null,
        preferredSettings: signatureData.preferredSettings || null,
        averageRating: avgRating,
        servicesCount: bookings.length,
      },
    });

    return successResponse(signature);
  } catch (error: any) {
    console.error("Error learning stylist signature:", error);
    return errorResponse(error.message || "Failed to learn signature", 500);
  }
}

// GET /api/personalization/stylist/signature/[staffId]
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return errorResponse("Staff ID is required", 400);
    }

    const signature = await prisma.stylistSignatureStyle.findUnique({
      where: { staffId },
    });

    if (!signature) {
      return errorResponse("Signature not found", 404);
    }

    return successResponse(signature);
  } catch (error: any) {
    console.error("Error fetching signature:", error);
    return errorResponse(error.message || "Failed to fetch signature", 500);
  }
}

