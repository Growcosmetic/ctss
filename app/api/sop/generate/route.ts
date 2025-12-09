// ============================================
// SOP - Generate SOP using AI
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { prisma } from "@/lib/prisma";
import { sopPrompt } from "@/core/prompts/sopPrompt";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, title, role, context, autoSave } = body;

    // Validation
    if (!step || !title || !role) {
      return NextResponse.json(
        { error: "step, title, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["receptionist", "stylist", "assistant", "online", "all"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate SOP using AI
    const prompt = sopPrompt({
      step,
      role,
      title,
      context,
    });

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là Giám đốc vận hành salon chuyên nghiệp. Tạo SOP rõ ràng, chi tiết, có thể thực hiện được. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return SOP content");
    }

    // Parse JSON
    let sopDetail;
    try {
      sopDetail = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        sopDetail = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Auto-save if requested
    let savedSOP = null;
    if (autoSave) {
      savedSOP = await prisma.sOP.create({
        data: {
          step,
          title: sopDetail.title || title,
          detail: sopDetail,
          role,
        },
      });
    }

    return NextResponse.json({
      success: true,
      sop: {
        step,
        title: sopDetail.title || title,
        detail: sopDetail,
        role,
        ...(savedSOP && { id: savedSOP.id }),
      },
      saved: !!savedSOP,
    });
  } catch (err: any) {
    console.error("Generate SOP error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate SOP",
      },
      { status: 500 }
    );
  }
}

