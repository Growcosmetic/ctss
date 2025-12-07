// ============================================
// PHASE 30E - Damage Mapping
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { videoDamageMappingPrompt } from "@/core/prompts/videoDamageMappingPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-video/analyze/damage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, videoUrl } = body;

    if (!videoId && !videoUrl) {
      return errorResponse("Video ID or Video URL is required", 400);
    }

    // Get video record if videoId provided
    let video;
    let finalVideoUrl = videoUrl;

    if (videoId) {
      video = await prisma.hairAnalysisVideo.findUnique({
        where: { id: videoId },
        include: {
          frames: {
            orderBy: { timestamp: "asc" },
            take: 30, // Use more frames for damage detection
          },
        },
      });

      if (!video) {
        return errorResponse("Video not found", 404);
      }

      finalVideoUrl = video.videoUrl;
    }

    // Check if analysis already exists
    if (videoId) {
      const existing = await prisma.hairDamageMapping.findUnique({
        where: { videoId },
      });

      if (existing) {
        return successResponse(existing);
      }
    }

    // Generate prompt
    const prompt = videoDamageMappingPrompt();

    // Get frames for damage detection
    const frames = video?.frames || [];
    const keyFrames = frames.filter((_, i) => i % 3 === 0).slice(0, 12);

    // Build messages
    const messages: any[] = [
      {
        role: "system",
        content:
          "Bạn là chuyên gia phân tích và mapping hư tổn tóc. Phân tích các vùng hư tổn và trả về JSON hợp lệ.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...(keyFrames.length > 0
            ? keyFrames.map((frame) => ({
                type: "image_url" as const,
                image_url: { url: frame.imageUrl },
              }))
            : [
                {
                  type: "image_url" as const,
                  image_url: { url: finalVideoUrl },
                },
              ]),
        ],
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 2000,
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
      console.error("Failed to parse damage mapping JSON:", parseError);
      return errorResponse("Failed to parse analysis response", 500);
    }

    // Save analysis if videoId provided
    if (videoId) {
      const analysis = await prisma.hairDamageMapping.create({
        data: {
          videoId,
          damageZones: analysisData.damageZones || null,
          overallDamage: analysisData.overallDamage || null,
          damageLevel: analysisData.damageLevel || null,
          damageTypes: analysisData.damageTypes || [],
          endsDamage: analysisData.endsDamage || null,
          midDamage: analysisData.midDamage || null,
          rootDamage: analysisData.rootDamage || null,
          crownDamage: analysisData.crownDamage || null,
          sidesDamage: analysisData.sidesDamage || null,
          endsSeverity: analysisData.endsSeverity || null,
          midSeverity: analysisData.midSeverity || null,
          rootSeverity: analysisData.rootSeverity || null,
          damageMapUrl: null, // Would be generated visualization in production
          aiDescription: analysisData.aiDescription || null,
          confidence: analysisData.confidence || null,
        },
      });

      return successResponse(analysis);
    }

    return successResponse(analysisData);
  } catch (error: any) {
    console.error("Error mapping damage:", error);
    return errorResponse(error.message || "Failed to map damage", 500);
  }
}

