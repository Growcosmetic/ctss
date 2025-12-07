// ============================================
// Quality Control - AI Correction Suggestions
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { correctionSuggestionPrompt } from "@/core/prompts/correctionSuggestionPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { errorId, bookingId, errorType, errorDescription, location, serviceType } = await req.json();

    if (!errorId && !errorType) {
      return NextResponse.json(
        { error: "errorId or errorType is required" },
        { status: 400 }
      );
    }

    // Get error details if errorId provided
    let error = null;
    if (errorId) {
      error = await prisma.errorDetection.findUnique({
        where: { id: errorId },
      });
    }

    // Get service info
    let serviceName = serviceType || null;
    if (error?.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: error.serviceId },
        select: { name: true },
      });
      serviceName = service?.name || null;
    }

    // Get current metrics from quality score if available
    let currentMetrics = null;
    if (error?.bookingId) {
      const qualityScore = await prisma.qualityScore.findFirst({
        where: { bookingId: error.bookingId },
        orderBy: { capturedAt: "desc" },
      });
      if (qualityScore) {
        currentMetrics = {
          evenness: qualityScore.evenness,
          tension: qualityScore.tension,
          productAmount: qualityScore.productAmount,
          temperature: qualityScore.temperature,
          timing: qualityScore.timing,
        };
      }
    }

    // AI Correction Suggestion
    const prompt = correctionSuggestionPrompt({
      errorType: error?.errorType || errorType,
      errorDescription: error?.description || errorDescription,
      location: error?.location || location,
      serviceType: serviceName,
      currentMetrics,
    });

    let suggestion;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Correction Specialist chuyên nghiệp. Đưa ra gợi ý chỉnh sửa cụ thể, dễ thực hiện. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        suggestion = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI correction suggestion error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate suggestion",
        },
        { status: 500 }
      );
    }

    // Create correction suggestion
    const correction = await prisma.correctionSuggestion.create({
      data: {
        errorId: errorId || null,
        bookingId: error?.bookingId || bookingId || null,
        suggestion: suggestion.suggestion || "No suggestion",
        action: suggestion.action || null,
        priority: suggestion.priority || "MEDIUM",
        status: "PENDING",
        isAIGenerated: true,
        confidence: 85,
      },
    });

    return NextResponse.json({
      success: true,
      suggestion: correction,
      aiData: suggestion,
    });
  } catch (err: any) {
    console.error("Generate correction suggestion error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate suggestion",
      },
      { status: 500 }
    );
  }
}

// Get suggestions
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const errorId = searchParams.get("errorId");
    const bookingId = searchParams.get("bookingId");
    const status = searchParams.get("status");

    const where: any = {};
    if (errorId) where.errorId = errorId;
    if (bookingId) where.bookingId = bookingId;
    if (status) where.status = status;

    const suggestions = await prisma.correctionSuggestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (err: any) {
    console.error("Get correction suggestions error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get suggestions",
      },
      { status: 500 }
    );
  }
}

