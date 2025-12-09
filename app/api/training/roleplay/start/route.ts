// ============================================
// Training - Start Roleplay Session
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { roleplayScenarioPrompt } from "@/core/prompts/roleplayScenarioPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { userId, customerType, role } = await req.json();

    if (!userId || !customerType || !role) {
      return NextResponse.json(
        {
          error: "userId, customerType, and role are required",
        },
        { status: 400 }
      );
    }

    // Generate scenario using AI
    const prompt = roleplayScenarioPrompt(customerType, role);

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI Scenario Generator chuyên nghiệp. Tạo tình huống thực tế, giống khách hàng thật. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return scenario");
    }

    let scenarioData;
    try {
      scenarioData = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenarioData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI scenario response");
      }
    }

    // Create roleplay session
    const session = await prisma.roleplaySession.create({
      data: {
        userId,
        role,
        scenario: scenarioData.scenario || "",
        persona: scenarioData.persona || "",
        messages: [
          {
            role: "customer",
            message: scenarioData.initialMessage || "",
            timestamp: new Date().toISOString(),
            emotion: scenarioData.emotion || "neutral",
          },
        ],
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        currentScenario: scenarioData,
      },
    });
  } catch (err: any) {
    console.error("Start roleplay error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to start roleplay session",
      },
      { status: 500 }
    );
  }
}

