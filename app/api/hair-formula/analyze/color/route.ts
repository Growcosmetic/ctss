// ============================================
// PHASE 29C - Color Breakdown
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { colorBreakdownPrompt } from "@/core/prompts/colorBreakdownPrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-formula/analyze/color
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, imageUrl } = body;

    if (!imageId && !imageUrl) {
      return errorResponse("Image ID or Image URL is required", 400);
    }

    // Get image record if imageId provided
    let image;
    let finalImageUrl = imageUrl;

    if (imageId) {
      image = await prisma.hairStyleImage.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        return errorResponse("Image not found", 404);
      }

      finalImageUrl = image.imageUrl;
    }

    // Check if analysis already exists
    if (imageId) {
      const existing = await prisma.colorAnalysis.findUnique({
        where: { imageId },
      });

      if (existing) {
        return successResponse(existing);
      }
    }

    // Generate prompt
    const prompt = colorBreakdownPrompt();

    // Call OpenAI Vision API
    const messages: any[] = [
      {
        role: "system",
        content:
          "Bạn là chuyên gia phân tích màu tóc chuyên nghiệp. Phân tích chính xác và trả về JSON hợp lệ.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: finalImageUrl },
          },
        ],
      },
    ];

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not return analysis", 500);
    }

    // Parse JSON
    let analysisData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysisData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse color analysis JSON:", parseError);
      return errorResponse("Failed to parse analysis response", 500);
    }

    // Save analysis if imageId provided
    if (imageId) {
      const analysis = await prisma.colorAnalysis.create({
        data: {
          imageId,
          baseLevel: analysisData.baseLevel || null,
          baseTone: analysisData.baseTone || null,
          baseColor: analysisData.baseColor || null,
          midLevel: analysisData.midLevel || null,
          midTone: analysisData.midTone || null,
          midColor: analysisData.midColor || null,
          endLevel: analysisData.endLevel || null,
          endTone: analysisData.endTone || null,
          endColor: analysisData.endColor || null,
          hasHighlights: analysisData.hasHighlights || false,
          highlightLevel: analysisData.highlightLevel || null,
          highlightTone: analysisData.highlightTone || null,
          highlightColor: analysisData.highlightColor || null,
          highlightDistribution: analysisData.highlightDistribution || null,
          undertone: analysisData.undertone || null,
          saturation: analysisData.saturation || null,
          lightness: analysisData.lightness || null,
          overallColorDesc: analysisData.overallColorDesc || null,
          technique: analysisData.technique || null,
          aiDescription: analysisData.aiDescription || null,
          confidence: analysisData.confidence || null,
        },
      });

      return successResponse(analysis);
    }

    return successResponse(analysisData);
  } catch (error: any) {
    console.error("Error analyzing color:", error);
    return errorResponse(error.message || "Failed to analyze color", 500);
  }
}

