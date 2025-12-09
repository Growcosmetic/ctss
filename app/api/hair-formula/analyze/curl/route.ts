// ============================================
// PHASE 29B - Curl Pattern Detection
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { curlPatternDetectionPrompt } from "@/core/prompts/curlPatternDetectionPrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-formula/analyze/curl
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
      const existing = await prisma.curlPatternAnalysis.findUnique({
        where: { imageId },
      });

      if (existing) {
        return successResponse(existing);
      }
    }

    // Generate prompt
    const prompt = curlPatternDetectionPrompt();

    // Call OpenAI Vision API
    const messages: any[] = [
      {
        role: "system",
        content:
          "Bạn là chuyên gia phân tích pattern xoăn chuyên nghiệp. Phân tích chính xác và trả về JSON hợp lệ.",
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
      max_tokens: 1000,
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
      console.error("Failed to parse curl analysis JSON:", parseError);
      return errorResponse("Failed to parse analysis response", 500);
    }

    // Save analysis if imageId provided
    if (imageId) {
      const analysis = await prisma.curlPatternAnalysis.create({
        data: {
          imageId,
          curlPattern: analysisData.curlPattern || null,
          curlPatternDesc: analysisData.curlPatternDesc || null,
          bounce: analysisData.bounce || null,
          density: analysisData.density || null,
          curlDirection: analysisData.curlDirection || null,
          curlSize: analysisData.curlSize || null,
          curlTightness: analysisData.curlTightness || null,
          curlDistribution: analysisData.curlDistribution || null,
          aiDescription: analysisData.aiDescription || null,
          confidence: analysisData.confidence || null,
        },
      });

      return successResponse(analysis);
    }

    return successResponse(analysisData);
  } catch (error: any) {
    console.error("Error detecting curl pattern:", error);
    return errorResponse(error.message || "Failed to detect curl pattern", 500);
  }
}

