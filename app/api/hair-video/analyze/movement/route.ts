// ============================================
// PHASE 30B - Real-time Hair Movement Analysis
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { videoMovementAnalysisPrompt } from "@/core/prompts/videoMovementAnalysisPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-video/analyze/movement
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
            take: 30, // Use first 30 frames for analysis
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
      const existing = await prisma.hairMovementAnalysis.findUnique({
        where: { videoId },
      });

      if (existing) {
        return successResponse(existing);
      }
    }

    // Generate prompt
    const prompt = videoMovementAnalysisPrompt();

    // For video analysis, we'll use key frames
    // In production, send multiple frames to OpenAI Vision
    const frames = video?.frames || [];
    const keyFrames = frames.filter((_, i) => i % 5 === 0).slice(0, 6); // Every 5th frame, max 6 frames

    // Build messages with video frames
    const messages: any[] = [
      {
        role: "system",
        content:
          "Bạn là chuyên gia phân tích chuyển động tóc. Phân tích chính xác và trả về JSON hợp lệ.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          // Add key frames for analysis
          ...(keyFrames.length > 0
            ? keyFrames.map((frame) => ({
                type: "image_url" as const,
                image_url: { url: frame.imageUrl },
              }))
            : [
                {
                  type: "image_url" as const,
                  image_url: { url: finalVideoUrl }, // Fallback to video thumbnail if no frames
                },
              ]),
        ],
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Vision-capable model
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
      console.error("Failed to parse movement analysis JSON:", parseError);
      return errorResponse("Failed to parse analysis response", 500);
    }

    // Save analysis if videoId provided
    if (videoId) {
      const analysis = await prisma.hairMovementAnalysis.create({
        data: {
          videoId,
          movementScore: analysisData.movementScore || null,
          bounceScore: analysisData.bounceScore || null,
          frizzScore: analysisData.frizzScore || null,
          fiberCohesion: analysisData.fiberCohesion || null,
          softnessScore: analysisData.softnessScore || null,
          movementType: analysisData.movementType || null,
          bounceLevel: analysisData.bounceLevel || null,
          frizzLevel: analysisData.frizzLevel || null,
          densityDistribution: analysisData.densityDistribution || null,
          fiberInteraction: analysisData.fiberInteraction || null,
          aiDescription: analysisData.aiDescription || null,
          confidence: analysisData.confidence || null,
        },
      });

      return successResponse(analysis);
    }

    return successResponse(analysisData);
  } catch (error: any) {
    console.error("Error analyzing movement:", error);
    return errorResponse(error.message || "Failed to analyze movement", 500);
  }
}

