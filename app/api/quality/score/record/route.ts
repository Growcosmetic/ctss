// ============================================
// Quality Control - Real-time Quality Scoring
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { qualityScoringPrompt } from "@/core/prompts/qualityScoringPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const {
      bookingId,
      serviceId,
      staffId,
      evenness,
      tension,
      productAmount,
      spacing,
      temperature,
      timing,
      observations,
    } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    // Get service info
    let serviceType = null;
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { name: true },
      });
      serviceType = service?.name || null;
    }

    // AI Scoring
    const prompt = qualityScoringPrompt({
      serviceType,
      evenness,
      tension,
      productAmount,
      spacing,
      temperature,
      timing,
      observations,
    });

    let scoring;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Quality Control Specialist chuyên nghiệp. Chấm điểm chất lượng chính xác, công bằng. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        scoring = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI quality scoring error:", aiError);
      // Fallback to manual calculation
      scoring = {
        overallScore: 75,
        technicalScore: 75,
        consistencyScore: 75,
        timingScore: timing || 75,
        productScore: productAmount || 75,
      };
    }

    // Create quality score record
    const qualityScore = await prisma.qualityScore.create({
      data: {
        bookingId,
        serviceId: serviceId || null,
        staffId: staffId || null,
        overallScore: scoring.overallScore || 75,
        technicalScore: scoring.technicalScore || undefined,
        consistencyScore: scoring.consistencyScore || undefined,
        timingScore: scoring.timingScore || undefined,
        productScore: scoring.productScore || undefined,
        evenness: scoring.evenness || evenness || undefined,
        tension: scoring.tension || tension || undefined,
        productAmount: scoring.productAmount || productAmount || undefined,
        spacing: scoring.spacing || spacing || undefined,
        temperature: scoring.temperature || temperature || undefined,
        timing: scoring.timing || timing || undefined,
        aiAnalysis: scoring.analysis || null,
        strengths: scoring.strengths || [],
        weaknesses: scoring.weaknesses || [],
      },
    });

    return NextResponse.json({
      success: true,
      score: qualityScore,
      aiData: scoring,
    });
  } catch (err: any) {
    console.error("Record quality score error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to record quality score",
      },
      { status: 500 }
    );
  }
}

// Get quality scores
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const staffId = searchParams.get("staffId");
    const serviceId = searchParams.get("serviceId");

    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (staffId) where.staffId = staffId;
    if (serviceId) where.serviceId = serviceId;

    const scores = await prisma.qualityScore.findMany({
      where,
      orderBy: { capturedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      scores,
    });
  } catch (err: any) {
    console.error("Get quality scores error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get quality scores",
      },
      { status: 500 }
    );
  }
}

