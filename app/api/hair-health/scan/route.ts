// ============================================
// Hair Health - AI Scan
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hairHealthScanPrompt } from "@/core/prompts/hairHealthScanPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { customerId, imageUrl, videoUrl, imageDescription } = await req.json();

    if (!imageUrl && !videoUrl && !imageDescription) {
      return NextResponse.json(
        { error: "imageUrl, videoUrl, or imageDescription is required" },
        { status: 400 }
      );
    }

    // AI Analysis
    const prompt = hairHealthScanPrompt(imageDescription);

    let analysis;
    try {
      const messages: any[] = [
        {
          role: "system",
          content:
            "Bạn là AI Hair Health Diagnostic Specialist chuyên nghiệp. Phân tích sức khỏe tóc chi tiết, phát hiện hư tổn, đánh giá rủi ro. Trả về JSON hợp lệ.",
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

      const completion = await client.chat.completions.create({
        model: imageUrl ? "gpt-4o-mini" : "gpt-4o-mini",
        messages,
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        analysis = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI hair health scan error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to analyze hair health",
        },
        { status: 500 }
      );
    }

    // Create scan record
    const scan = await prisma.hairHealthScan.create({
      data: {
        customerId: customerId || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        healthScore: analysis.healthScore || null,
        dryness: analysis.dryness || null,
        elasticity: analysis.elasticity || null,
        damageSpots: analysis.damageSpots || null,
        porosity: analysis.porosity || null,
        moistureRetention: analysis.moistureRetention || null,
        shine: analysis.shine || null,
        colorEvenness: analysis.colorEvenness || null,
        patchyColor: analysis.patchyColor || null,
        brokenStrands: analysis.brokenStrands || null,
        splitEnds: analysis.splitEnds || null,
        whiteDots: analysis.whiteDots || null,
        burnedHair: analysis.burnedHair || null,
        puffyHair: analysis.puffyHair || null,
        damageAtRoot: analysis.damageAtRoot || null,
        damageAtMid: analysis.damageAtMid || null,
        damageAtEnd: analysis.damageAtEnd || null,
        aiAnalysis: analysis.analysis || null,
        detectedIssues: analysis.detectedIssues || [],
        recommendations: analysis.recommendations || null,
        isAIGenerated: true,
        confidence: 80, // Can be calculated from AI response
      },
    });

    return NextResponse.json({
      success: true,
      scan,
      aiData: analysis,
    });
  } catch (err: any) {
    console.error("Hair health scan error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to scan hair health",
      },
      { status: 500 }
    );
  }
}

// Get scans
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const scans = await prisma.hairHealthScan.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      scans,
    });
  } catch (err: any) {
    console.error("Get hair health scans error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get scans",
      },
      { status: 500 }
    );
  }
}

