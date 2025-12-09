// ============================================
// Stylist Assistant - Style Matching
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { styleMatchingPrompt } from "@/core/prompts/styleMatchingPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { customerId, personalStyle, preferences, vibe } = await req.json();

    if (!personalStyle) {
      return NextResponse.json(
        { error: "personalStyle is required" },
        { status: 400 }
      );
    }

    // AI Analysis
    const prompt = styleMatchingPrompt({
      personalStyle,
      preferences,
      vibe,
    });

    let matching;
    try {
      const completion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Style Matching Specialist chuyên nghiệp. Phân tích phong cách và đề xuất kiểu tóc phù hợp. Trả về JSON hợp lệ.",
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
        matching = JSON.parse(rawOutput);
      }
    } catch (aiError) {
      console.error("AI style matching error:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to analyze style",
        },
        { status: 500 }
      );
    }

    // Create matching record
    const styleMatch = await prisma.styleMatching.create({
      data: {
        customerId: customerId || null,
        personalStyle: matching.personalStyle || personalStyle,
        styleTags: matching.styleTags || [],
        vibe: matching.vibe || vibe || null,
        matchedStyles: matching.matchedStyles || [],
        matchedColors: matching.matchedColors || [],
        confidence: matching.confidence || 70,
        styleAnalysis: matching.styleAnalysis || null,
      },
    });

    return NextResponse.json({
      success: true,
      matching: styleMatch,
      aiData: matching,
    });
  } catch (err: any) {
    console.error("Style match analyze error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze style",
      },
      { status: 500 }
    );
  }
}

// Get style matching
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const matchings = await prisma.styleMatching.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    return NextResponse.json({
      success: true,
      matching: matchings[0] || null,
    });
  } catch (err: any) {
    console.error("Get style matching error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get style matching",
      },
      { status: 500 }
    );
  }
}

