// ============================================
// PHASE 29A - Hair Style Analyzer
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { cookies } from "next/headers";
import { hairStyleAnalyzerPrompt } from "@/core/prompts/hairStyleAnalyzerPrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-formula/analyze/style
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
      const existing = await prisma.hairStyleAnalysis.findUnique({
        where: { imageId },
      });

      if (existing) {
        return successResponse(existing);
      }
    }

    // Generate prompt
    const prompt = hairStyleAnalyzerPrompt();

    // Call OpenAI Vision API
    const messages: any[] = [
      {
        role: "system",
        content:
          "Bạn là chuyên gia phân tích kiểu tóc chuyên nghiệp. Phân tích chính xác và trả về JSON hợp lệ.",
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
      model: "gpt-4o", // Use vision-capable model
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
      console.error("Failed to parse analysis JSON:", parseError);
      return errorResponse("Failed to parse analysis response", 500);
    }

    // Save analysis if imageId provided
    if (imageId) {
      const analysis = await prisma.hairStyleAnalysis.create({
        data: {
          imageId,
          styleType: analysisData.styleType || null,
          length: analysisData.length || null,
          lengthCm: analysisData.lengthCm || null,
          texture: analysisData.texture || null,
          hairThickness: analysisData.hairThickness || null,
          volumeTop: analysisData.volumeTop || null,
          volumeSide: analysisData.volumeSide || null,
          shineLevel: analysisData.shineLevel || null,
          dryness: analysisData.dryness || null,
          damageLevel: analysisData.damageLevel || null,
          porosity: analysisData.porosity || null,
          colorLevel: analysisData.colorLevel || null,
          baseTone: analysisData.baseTone || null,
          overallColor: analysisData.overallColor || null,
          existingPattern: analysisData.existingPattern || null,
          aiDescription: analysisData.aiDescription || null,
          confidence: analysisData.confidence || null,
        },
      });

      return successResponse(analysis);
    }

    return successResponse(analysisData);
  } catch (error: any) {
    console.error("Error analyzing hair style:", error);
    return errorResponse(error.message || "Failed to analyze hair style", 500);
  }
}

