// ============================================
// Quality Control - Error Detection
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { errorDetectionPrompt } from "@/core/prompts/errorDetectionPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const {
      bookingId,
      serviceId,
      staffId,
      observations,
      qualityScoreId,
    } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    // Get quality score if provided
    let qualityScore = null;
    let metrics = null;
    if (qualityScoreId) {
      qualityScore = await prisma.qualityScore.findUnique({
        where: { id: qualityScoreId },
      });
      if (qualityScore) {
        metrics = {
          evenness: qualityScore.evenness,
          tension: qualityScore.tension,
          productAmount: qualityScore.productAmount,
          spacing: qualityScore.spacing,
          temperature: qualityScore.temperature,
          timing: qualityScore.timing,
        };
      }
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

    // AI Error Detection
    const prompt = errorDetectionPrompt({
      serviceType,
      observations,
      qualityScore: qualityScore?.overallScore || undefined,
      metrics,
    });

    let detectedErrors;
    try {
      const completion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Error Detection Specialist chuyên nghiệp. Phát hiện lỗi kỹ thuật chính xác. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        detectedErrors = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI error detection error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to detect errors",
        },
        { status: 500 }
      );
    }

    // Create error records
    const errors = [];
    for (const errorData of detectedErrors.errors || []) {
      const error = await prisma.errorDetection.create({
        data: {
          bookingId,
          serviceId: serviceId || null,
          staffId: staffId || null,
          errorType: errorData.errorType,
          errorCategory: errorData.errorCategory || "TECHNICAL",
          severity: errorData.severity || "MEDIUM",
          location: errorData.location || null,
          description: errorData.description || "Error detected",
          detectionMethod: "AI",
          status: "DETECTED",
        },
      });
      errors.push(error);
    }

    return NextResponse.json({
      success: true,
      errors,
      analysis: detectedErrors.analysis || null,
    });
  } catch (err: any) {
    console.error("Detect errors error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to detect errors",
      },
      { status: 500 }
    );
  }
}

// Get errors
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const errors = await prisma.errorDetection.findMany({
      where,
      orderBy: { detectedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      errors,
      total: errors.length,
    });
  } catch (err: any) {
    console.error("Get errors error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get errors",
      },
      { status: 500 }
    );
  }
}

