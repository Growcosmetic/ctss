// ============================================
// Marketing Calendar Generator API
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import {
  marketingCalendarPrompt,
  type MarketingCalendarPayload,
} from "@/core/prompts/marketingCalendarPrompt";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { range, goal, platform, focus, season } = body;

    // Validation
    if (!range || !goal || !platform) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: range (7 or 30), goal, platform",
        },
        { status: 400 }
      );
    }

    if (range !== "7" && range !== "30") {
      return NextResponse.json(
        { error: "Range must be '7' or '30'" },
        { status: 400 }
      );
    }

    // Build prompt
    const payload: MarketingCalendarPayload = {
      range,
      goal,
      platform,
      focus,
      season,
    };

    const promptText = marketingCalendarPrompt(payload);

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI Marketing Planner cấp cao cho salon tóc. Tạo lịch content marketing chi tiết, đa dạng, chất lượng. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: promptText,
        },
      ],
      max_tokens: 2500, // More tokens for longer calendar
      temperature: 0.8,
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
    if (!output.items || !Array.isArray(output.items)) {
      throw new Error("Invalid output structure: missing items array");
    }

    // Add dates if not present
    const startDate = new Date();
    output.items = output.items.map((item: any, index: number) => {
      if (!item.date) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        item.date = date.toISOString().split("T")[0];
      }
      return item;
    });

    // Auto-save calendar items to Content Library (non-blocking)
    // Save each calendar item individually
    if (output.items && Array.isArray(output.items)) {
      output.items.forEach((item: any) => {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/marketing/library/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "calendar_item",
            topic: item.topic,
            content: {
              contentIdea: item.contentIdea,
              format: item.format,
            },
            cta: item.cta,
            platform,
            style: undefined, // Calendar doesn't have style
            tags: item.topic ? [item.topic.toLowerCase()] : [],
          }),
        }).catch((err) => {
          console.error("Failed to save calendar item to library:", err);
        });
      });
    }

    return NextResponse.json({
      success: true,
      ...output,
    });
  } catch (error: any) {
    console.error("Marketing calendar generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate marketing calendar",
      },
      { status: 500 }
    );
  }
}

