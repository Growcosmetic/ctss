// ============================================
// SOP - AI Support for Receptionist
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { sopSupportPrompt } from "@/core/prompts/sopSupportPrompt";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { situation, context, customerInfo } = body;

    if (!situation) {
      return NextResponse.json(
        { error: "situation is required" },
        { status: 400 }
      );
    }

    // Generate support advice using AI
    const prompt = sopSupportPrompt({
      situation,
      context,
      customerInfo,
    });

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI hỗ trợ Lễ Tân chuyên nghiệp. Đưa ra giải pháp tinh tế, thực tế, dễ thực hiện. Trả về JSON hợp lệ.",
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
      throw new Error("AI did not return support advice");
    }

    // Parse JSON
    let support;
    try {
      support = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        support = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return NextResponse.json({
      success: true,
      support,
    });
  } catch (err: any) {
    console.error("SOP support error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get support advice",
      },
      { status: 500 }
    );
  }
}

