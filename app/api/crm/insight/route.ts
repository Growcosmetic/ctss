// ============================================
// CRM Insight - AI phân tích khách hàng
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { crmInsightPrompt } from "@/core/prompts/crmInsightPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        visits: {
          orderBy: { date: "desc" },
          take: 20,
        },
        tags: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Generate AI insight
    const prompt = crmInsightPrompt(
      customer,
      customer.visits,
      customer.tags
    );

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI CRM Analyst chuyên nghiệp. Phân tích chính xác, đưa ra gợi ý thực tế. Trả về JSON hợp lệ.",
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

    if (!rawOutput) {
      throw new Error("AI did not return insight");
    }

    // Parse JSON
    let insight;
    try {
      insight = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insight = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Update customer riskLevel if AI suggests different
    if (insight.riskLevel && insight.riskLevel !== customer.riskLevel) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { riskLevel: insight.riskLevel },
      });
    }

    return NextResponse.json({
      success: true,
      insight,
    });
  } catch (err: any) {
    console.error("Generate insight error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate insight",
      },
      { status: 500 }
    );
  }
}

