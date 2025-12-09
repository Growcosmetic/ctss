// ============================================
// Marketing Content Generator API
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { marketingContentPrompt, type MarketingContentPayload } from "@/core/prompts/marketingContentPrompt";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, goal, platform, style, additionalContext } = body;

    // Validation
    if (!topic || !goal || !platform || !style) {
      return NextResponse.json(
        { error: "Missing required fields: topic, goal, platform, style" },
        { status: 400 }
      );
    }

    // Build prompt
    const payload: MarketingContentPayload = {
      topic,
      goal,
      platform,
      style,
      additionalContext,
    };

    const promptText = marketingContentPrompt(payload);

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI Marketing của Chí Tâm Hair Salon. Tạo nội dung marketing chuyên nghiệp, tinh tế, phù hợp với thương hiệu salon cao cấp. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: promptText,
        },
      ],
      max_tokens: 500,
      temperature: 0.8, // Slightly creative for engaging content
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return any content");
    }

    // Parse JSON
    let output;
    try {
      output = JSON.parse(rawOutput);
    } catch (parseError) {
      // Try to extract JSON from markdown if present
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        output = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Validate output structure
    if (!output.headline || !output.content) {
      throw new Error("Invalid output structure from AI");
    }

    // Auto-optimize CTA if needed (optional - can be enhanced later)
    // For now, use the CTA from AI output

    // Auto-save to Content Library (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/marketing/library/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "post",
        topic,
        content: output,
        cta: output.cta,
        platform,
        style,
        tags: topic ? [topic.toLowerCase()] : [],
      }),
    }).catch((err) => {
      console.error("Failed to save to content library:", err);
    });

    return NextResponse.json({
      success: true,
      ...output,
    });
  } catch (error: any) {
    console.error("Marketing content generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate marketing content",
      },
      { status: 500 }
    );
  }
}

