// ============================================
// Customer Insight Generator
// ============================================

import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { customerInsightAnalysisPrompt } from "@/core/prompts/customerInsightAnalysisPrompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateCustomerInsight(
  customerId: string
): Promise<any> {
  // Get customer profile
  const profile = await prisma.customerProfile.findUnique({
    where: { customerId },
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
    throw new Error(`Customer profile not found: ${customerId}`);
  }

  // Build prompt
  const promptText = customerInsightAnalysisPrompt(profile);

  // Call OpenAI
  const completion = await client.chat.completions.create({
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
    where: { customerId },
    data: {
      insight,
      updatedAt: new Date(),
    },
  });

  return insight;
}

