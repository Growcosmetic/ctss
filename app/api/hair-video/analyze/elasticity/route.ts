// ============================================
// PHASE 30C - Elasticity & Stretch Detection
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { videoElasticityAnalysisPrompt } from "@/core/prompts/videoElasticityAnalysisPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-video/analyze/elasticity
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
      const existing = await prisma.hairElasticityAnalysis.findUnique({
        where: { videoId },
      });

      if (existing) {
        return successResponse(existing);
      }
    }

    // Generate prompt
    const prompt = videoElasticityAnalysisPrompt();

    // Get key frames showing stretch test
    const frames = video?.frames || [];
    // For elasticity test, we need frames showing the stretch
    const keyFrames = frames.filter((_, i) => i % 3 === 0).slice(0, 10);

    // Build messages
    const messages: any[] = [
      {
        role: "system",
        content:
          "Bạn là chuyên gia phân tích độ đàn hồi tóc. Phân tích video test stretch và trả về JSON hợp lệ.",
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
      console.error("Failed to parse elasticity analysis JSON:", parseError);
      return errorResponse("Failed to parse analysis response", 500);
    }

    // Save analysis if videoId provided
    if (videoId) {
      const analysis = await prisma.hairElasticityAnalysis.create({
        data: {
          videoId,
          stretchPercent: analysisData.stretchPercent || null,
          snapbackRate: analysisData.snapbackRate || null,
          elasticityScore: analysisData.elasticityScore || null,
          gumHairRisk: analysisData.gumHairRisk || null,
          breakageRisk: analysisData.breakageRisk || null,
          damageRisk: analysisData.damageRisk || null,
          testType: analysisData.testType || null,
          stretchDistance: analysisData.stretchDistance || null,
          recoveryTime: analysisData.recoveryTime || null,
          elasticityStatus: analysisData.elasticityStatus || null,
          recommendations: analysisData.recommendations || [],
          aiDescription: analysisData.aiDescription || null,
          confidence: analysisData.confidence || null,
        },
      });

      return successResponse(analysis);
    }

    return successResponse(analysisData);
  } catch (error: any) {
    console.error("Error analyzing elasticity:", error);
    return errorResponse(error.message || "Failed to analyze elasticity", 500);
  }
}

