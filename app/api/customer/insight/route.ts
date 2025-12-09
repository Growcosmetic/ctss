// ============================================
// Customer Insight API
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { customerInsightAnalysisPrompt } from "@/core/prompts/customerInsightAnalysisPrompt";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, phone } = body;

    if (!customerId && !phone) {
      return NextResponse.json(
        { error: "customerId or phone is required" },
        { status: 400 }
      );
    }

    // Get customer profile
    const profile = await prisma.customerProfile.findUnique({
      where: customerId
        ? { customerId }
        : { phone: phone || undefined },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            journeyState: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Customer profile not found" },
        { status: 404 }
      );
    }

    // Build prompt
    const promptText = customerInsightAnalysisPrompt(profile);

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI phân tích khách hàng salon Chí Tâm. Phân tích sâu và trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: promptText,
        },
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return any content");
    }

    // Parse JSON
    let insight;
    try {
      insight = JSON.parse(rawOutput);
    } catch (parseError) {
      // Try to extract JSON from markdown if present
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insight = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Update profile with new insight
    await prisma.customerProfile.update({
      where: customerId
        ? { customerId }
        : { phone: phone || undefined },
      data: {
        insight,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      insight,
    });
  } catch (error: any) {
    console.error("Customer insight API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate insight",
      },
      { status: 500 }
    );
  }
}

