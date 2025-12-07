// ============================================
// AI Runner (Router + Model Caller)
// ============================================

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function callAI(promptText: string) {
  try {
    // Note: OpenAI API doesn't have responses.create, using chat.completions.create instead
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Bạn là AI chuyên xử lý workflow cho salon."
        },
        {
          role: "user",
          content: promptText
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" }, // Force JSON response
    });

    return response.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`AI call failed: ${error.message || "Unknown error"}`);
  }
}

