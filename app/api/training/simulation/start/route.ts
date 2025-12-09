// ============================================
// Training Simulation - Start Session
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { simulationPrompt } from "@/core/prompts/simulationPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, scenario, persona, context } = body;

    // Validation
    if (!userId || !scenario || !persona) {
      return NextResponse.json(
        { error: "userId, scenario, and persona are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create simulation session
    const session = await prisma.simulationSession.create({
      data: {
        userId,
        scenario,
        persona,
        messages: [],
        status: "active",
      },
    });

    // Generate initial greeting from AI customer
    const prompt = simulationPrompt({
      scenario,
      persona,
      context,
    });

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: "Chào bạn, em cần tư vấn về tóc. (Stylist sẽ chào và hỏi thêm)",
        },
      ],
      max_tokens: 200,
      temperature: 0.8, // Higher temperature for more natural responses
    });

    const initialMessage = completion.choices[0]?.message?.content || "Xin chào, em cần tư vấn về tóc.";

    // Update session with initial message
    const updatedMessages = [
      {
        role: "assistant",
        content: initialMessage,
      },
    ];

    const updatedSession = await prisma.simulationSession.update({
      where: { id: session.id },
      data: {
        messages: updatedMessages,
      },
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
      initialMessage,
    });
  } catch (err: any) {
    console.error("Start simulation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to start simulation",
      },
      { status: 500 }
    );
  }
}

