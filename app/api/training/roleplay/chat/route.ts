// ============================================
// Training - Roleplay Chat (AI phản hồi như khách)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleplayBehaviorPrompt } from "@/core/prompts/roleplayBehaviorPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { sessionId, staffMessage } = await req.json();

    if (!sessionId || !staffMessage) {
      return NextResponse.json(
        { error: "sessionId and staffMessage are required" },
        { status: 400 }
      );
    }

    // Get session
    const session = await prisma.roleplaySession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "active") {
      return NextResponse.json(
        { error: "Session is not active" },
        { status: 400 }
      );
    }

    const messages = session.messages as any[];

    // Add staff message
    messages.push({
      role: "staff",
      message: staffMessage,
      timestamp: new Date().toISOString(),
    });

    // Get current emotion from last customer message
    const lastCustomerMsg = messages
      .slice()
      .reverse()
      .find((m: any) => m.role === "customer");
    const currentEmotion = lastCustomerMsg?.emotion || "neutral";

    // Generate AI customer response
    const prompt = roleplayBehaviorPrompt(
      session.persona,
      session.scenario,
      messages.slice(0, -1), // Exclude the just-added staff message for context
      staffMessage,
      currentEmotion
    );

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI đang đóng vai khách hàng. Phản hồi tự nhiên, giống người thật. KHÔNG được lộ là AI. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.9,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return response");
    }

    let customerResponse;
    try {
      customerResponse = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        customerResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    // Add customer message
    messages.push({
      role: "customer",
      message: customerResponse.message || "",
      timestamp: new Date().toISOString(),
      emotion: customerResponse.emotion || currentEmotion,
    });

    // Update session
    const updatedSession = await prisma.roleplaySession.update({
      where: { id: sessionId },
      data: {
        messages,
        status: customerResponse.shouldContinue === false ? "completed" : "active",
      },
    });

    return NextResponse.json({
      success: true,
      customerMessage: customerResponse.message,
      emotion: customerResponse.emotion,
      shouldContinue: customerResponse.shouldContinue !== false,
      session: updatedSession,
    });
  } catch (err: any) {
    console.error("Roleplay chat error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process chat",
      },
      { status: 500 }
    );
  }
}

