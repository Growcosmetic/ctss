// ============================================
// Quality Control - Post-service Audit
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { postServiceAuditPrompt } from "@/core/prompts/postServiceAuditPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const {
      bookingId,
      serviceId,
      staffId,
      beforeImageUrl,
      afterImageUrl,
      imageDescription,
      qualityScoreId,
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

    // Get quality score if provided
    let qualityScore = null;
    if (qualityScoreId) {
      qualityScore = await prisma.qualityScore.findUnique({
        where: { id: qualityScoreId },
        select: { overallScore: true },
      });
    }

    // AI Audit
    const prompt = postServiceAuditPrompt({
      serviceType,
      beforeImageUrl,
      afterImageUrl,
      imageDescription,
      qualityScore: qualityScore?.overallScore || undefined,
    });

    let audit;
    try {
      const messages: any[] = [
        {
          role: "system",
          content:
            "Bạn là AI Post-Service Audit Specialist chuyên nghiệp. Đánh giá kết quả dịch vụ chính xác, công bằng. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      if (afterImageUrl) {
        messages[1].content = [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: afterImageUrl } },
        ];
      }

      const completion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        audit = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI audit error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to perform audit",
        },
        { status: 500 }
      );
    }

    // Create audit record
    const auditRecord = await prisma.postServiceAudit.create({
      data: {
        bookingId,
        serviceId: serviceId || null,
        staffId: staffId || null,
        auditScore: audit.auditScore || 75,
        colorScore: audit.colorScore || null,
        curlScore: audit.curlScore || null,
        shineScore: audit.shineScore || null,
        evennessScore: audit.evennessScore || null,
        aiAnalysis: audit.analysis || null,
        strengths: audit.strengths || [],
        improvements: audit.improvements || [],
        beforeImageUrl: beforeImageUrl || null,
        afterImageUrl: afterImageUrl || null,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      audit: auditRecord,
      aiData: audit,
    });
  } catch (err: any) {
    console.error("Create audit error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create audit",
      },
      { status: 500 }
    );
  }
}

// Get audits
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

    const audits = await prisma.postServiceAudit.findMany({
      where,
      orderBy: { auditedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      audits,
    });
  } catch (err: any) {
    console.error("Get audits error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get audits",
      },
      { status: 500 }
    );
  }
}

