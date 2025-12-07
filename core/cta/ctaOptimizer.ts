// ============================================
// CTA Optimizer
// Combine rule-based and AI-based CTA optimization
// ============================================

import { getCTARule } from "./ctaRules";
import { ctaPrompt } from "@/core/prompts/ctaPrompt";
import type { CTAPromptPayload } from "@/core/prompts/ctaPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface CTAOptimizationResult {
  customerId?: string;
  phone?: string;
  name?: string;
  ruleCTA?: string;
  aiCTA: {
    cta: string;
    explanation?: string;
    priority?: string;
  };
  recommended?: string; // Best CTA recommendation
}

// ============================================
// Optimize CTA for Customer
// ============================================

export async function optimizeCTA(
  payload: CTAPromptPayload
): Promise<CTAOptimizationResult> {
  try {
    // 1) Get rule-based CTA
    const rule = getCTARule(payload.segment);
    const ruleCTA = rule?.cta;

    // 2) Generate AI-based CTA
    const promptText = ctaPrompt(payload);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia tối ưu CTA cho salon tóc. Tạo CTA ngắn gọn, tự nhiên, không hard sale. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: promptText,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return CTA content");
    }

    // Parse JSON
    let aiCTA;
    try {
      aiCTA = JSON.parse(rawOutput);
    } catch (parseError) {
      // Try to extract JSON from markdown if present
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiCTA = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: use raw output as CTA
        aiCTA = { cta: rawOutput.trim() };
      }
    }

    // 3) Determine recommended CTA
    // Prefer AI CTA if available, otherwise use rule CTA
    const recommended = aiCTA.cta || ruleCTA || "Nếu chị có câu hỏi gì, cứ nhắn em để em hỗ trợ nha 💕";

    return {
      ruleCTA,
      aiCTA: {
        cta: aiCTA.cta || "",
        explanation: aiCTA.explanation,
        priority: aiCTA.priority,
      },
      recommended,
    };
  } catch (error: any) {
    console.error("CTA optimization error:", error);
    // Fallback to rule-based CTA
    const rule = getCTARule(payload.segment);
    return {
      ruleCTA: rule?.cta || "Nếu chị có câu hỏi gì, cứ nhắn em để em hỗ trợ nha 💕",
      aiCTA: {
        cta: "",
        explanation: "Failed to generate AI CTA",
      },
      recommended: rule?.cta || "Nếu chị có câu hỏi gì, cứ nhắn em để em hỗ trợ nha 💕",
    };
  }
}

