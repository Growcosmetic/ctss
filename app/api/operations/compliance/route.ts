// ============================================
// Operations - SOP Compliance Checker (AI)
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { role, date } = await req.json();

    if (!role) {
      return NextResponse.json(
        { error: "role is required" },
        { status: 400 }
      );
    }

    // Calculate date range
    const startDate = date
      ? new Date(date + "T00:00:00.000Z")
      : new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = date
      ? new Date(date + "T23:59:59.999Z")
      : new Date(new Date().setHours(23, 59, 59, 999));

    // Get logs for this role
    const logs = await prisma.operationLog.findMany({
      where: {
        role,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: "asc" },
    });

    // Get SOP for this role
    const sops = await prisma.sOP.findMany({
      where: {
        role,
      },
      orderBy: { step: "asc" },
    });

    if (logs.length === 0) {
      return NextResponse.json({
        success: true,
        compliance: {
          passed: true,
          issues: [],
          warnings: [],
          suggestions: [],
          message: "Không có dữ liệu hoạt động trong ngày",
        },
      });
    }

    // AI Compliance Check
    const prompt = `
Bạn là chuyên gia kiểm tra tuân thủ SOP tại Chí Tâm Hair Salon.

PHÂN TÍCH DỮ LIỆU HOẠT ĐỘNG:

Bộ phận: ${role}
Ngày: ${date || "Hôm nay"}
Số lượng hoạt động: ${logs.length}

DỮ LIỆU LOGS:
${JSON.stringify(
  logs.map((l) => ({
    step: l.sopStep,
    action: l.action,
    timestamp: l.timestamp,
    user: l.user?.name || "System",
  })),
  null,
  2
)}

SOP YÊU CẦU (${sops.length} bước):
${JSON.stringify(
  sops.map((s) => ({
    step: s.step,
    title: s.title,
  })),
  null,
  2
)}

Hãy phân tích và trả về JSON:

{
  "passed": true/false,
  "issues": [
    {
      "severity": "high | medium | low",
      "step": 1-7,
      "description": "Mô tả vấn đề",
      "recommendation": "Gợi ý khắc phục"
    }
  ],
  "warnings": [
    {
      "step": 1-7,
      "description": "Cảnh báo",
      "recommendation": "Gợi ý"
    }
  ],
  "suggestions": [
    "Gợi ý cải thiện 1",
    "Gợi ý cải thiện 2"
  ],
  "summary": "Tóm tắt đánh giá",
  "complianceRate": 0-100
}

KIỂM TRA:
1. Tất cả 7 bước SOP đã được thực hiện đầy đủ?
2. Có bước nào bị bỏ sót không?
3. Thứ tự thực hiện có đúng không?
4. Có hành động nào đi ngược SOP không?
5. Tần suất thực hiện từng bước có đủ không?

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
    `;

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia kiểm tra tuân thủ SOP. Phân tích chính xác, đưa ra đánh giá khách quan. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return compliance check");
    }

    // Parse JSON
    let compliance;
    try {
      compliance = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        compliance = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return NextResponse.json({
      success: true,
      compliance,
      stats: {
        totalLogs: logs.length,
        totalSteps: sops.length,
        date: date || new Date().toISOString().split("T")[0],
      },
    });
  } catch (err: any) {
    console.error("Compliance check error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to check compliance",
      },
      { status: 500 }
    );
  }
}

