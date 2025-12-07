// ============================================
// Reels / Shorts Script Generator API
// ============================================

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { reelsPrompt, type ReelsPromptPayload } from "@/core/prompts/reelsPrompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
    const payload: ReelsPromptPayload = {
      topic,
      goal,
      platform,
      style,
      additionalContext,
    };

    const promptText = reelsPrompt(payload);

    // Call OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia sáng tạo nội dung Reels/TikTok/Shorts cho ngành salon. Tạo kịch bản video ngắn, hấp dẫn, dễ thực hiện. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: promptText,
        },
      ],
      max_tokens: 1000,
      temperature: 0.9, // Creative for engaging content
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
    if (!output.idea || !output.hook || !output.script) {
      throw new Error("Invalid output structure from AI");
    }

    // Auto-save to Content Library (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/marketing/library/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "reels",
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
    console.error("Reels generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate reels script",
      },
      { status: 500 }
    );
  }
}

