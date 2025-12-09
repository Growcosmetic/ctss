// ============================================
// CRM Dashboard - AI Insights
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
    const { dashboardData } = await req.json();

    if (!dashboardData) {
      return NextResponse.json(
        { error: "dashboardData is required" },
        { status: 400 }
      );
    }

    const prompt = `
Bạn là AI CRM Analyst chuyên nghiệp của Chí Tâm Hair Salon.

Dựa trên dashboard data sau, hãy phân tích và đưa ra insights:

DASHBOARD DATA:
${JSON.stringify(dashboardData, null, 2)}

Hãy phân tích và trả về JSON:

{
  "overallInsight": "Phân tích tổng quan về tình hình khách hàng (3-5 câu)",
  "keyFindings": [
    "Finding 1",
    "Finding 2",
    "Finding 3"
  ],
  "churnRisk": "LOW | MEDIUM | HIGH",
  "growthTrend": "INCREASING | STABLE | DECREASING",
  "topOpportunities": [
    {
      "title": "Cơ hội 1",
      "description": "Mô tả",
      "impact": "HIGH | MEDIUM | LOW"
    }
  ],
  "recommendations": [
    {
      "action": "Hành động cụ thể",
      "reason": "Lý do",
      "priority": "HIGH | MEDIUM | LOW"
    }
  ],
  "nextBestActions": [
    "Action 1",
    "Action 2",
    "Action 3"
  ]
}

LƯU Ý:
- Phân tích dựa trên số liệu thực tế
- Đưa ra insights có thể hành động được
- Ưu tiên retention và growth
- Tone chuyên nghiệp, tinh tế

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
    `;

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI CRM Analyst chuyên nghiệp. Phân tích chính xác, đưa ra insights thực tế. Trả về JSON hợp lệ.",
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

    if (!rawOutput) {
      throw new Error("AI did not return insights");
    }

    // Parse JSON
    let insights;
    try {
      insights = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (err: any) {
    console.error("Generate insights error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate insights",
      },
      { status: 500 }
    );
  }
}

