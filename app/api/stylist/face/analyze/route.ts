// ============================================
// Stylist Assistant - Face Analysis
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { faceAnalysisPrompt } from "@/core/prompts/faceAnalysisPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { customerId, imageUrl, imageDescription } = await req.json();

    if (!imageUrl && !imageDescription) {
      return NextResponse.json(
        { error: "imageUrl or imageDescription is required" },
        { status: 400 }
      );
    }

    // AI Analysis
    const prompt = faceAnalysisPrompt(imageDescription);

    let analysis;
    try {
      // If image URL provided, can use vision model
      const messages: any[] = [
        {
          role: "system",
          content:
            "Bạn là AI Face Analysis Specialist chuyên nghiệp. Phân tích khuôn mặt chính xác để đề xuất kiểu tóc phù hợp. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      if (imageUrl) {
        messages[1].content = [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ];
      }

      const completion = await getClient().chat.completions.create({
        model: imageUrl ? "gpt-4o-mini" : "gpt-4o-mini",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        analysis = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI face analysis error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to analyze face",
        },
        { status: 500 }
      );
    }

    // Create analysis record
    const faceAnalysis = await prisma.faceAnalysis.create({
      data: {
        customerId: customerId || null,
        faceShape: analysis.faceShape || "OVAL",
        jawline: analysis.jawline || null,
        forehead: analysis.forehead || null,
        cheekbones: analysis.cheekbones || null,
        chin: analysis.chin || null,
        features: analysis.features || null,
        overallVibe: analysis.overallVibe || null,
        analysisData: analysis,
        imageUrl: imageUrl || null,
        isAIGenerated: true,
        confidence: analysis.confidence || 70,
        recommendations: analysis.recommendations || null,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: faceAnalysis,
      aiData: analysis,
    });
  } catch (err: any) {
    console.error("Face analyze error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze face",
      },
      { status: 500 }
    );
  }
}

// Get face analysis
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const analyses = await prisma.faceAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    return NextResponse.json({
      success: true,
      analysis: analyses[0] || null,
    });
  } catch (err: any) {
    console.error("Get face analysis error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get face analysis",
      },
      { status: 500 }
    );
  }
}

