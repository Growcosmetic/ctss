// ============================================
// Training Simulation - Chat & Scoring
// ============================================

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { simulationPrompt } from "@/core/prompts/simulationPrompt";
import { evaluateStylist } from "@/core/scoring/evaluateStylist";
import { saveSkillProgress } from "@/core/scoring/addSkillProgress";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, message } = body;

    // Validation
    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "sessionId and message are required" },
        { status: 400 }
      );
    }

    // Get session
    const session = await prisma.simulationSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

    // Get existing messages
    const existingMessages = (session.messages as any[]) || [];

    // Build prompt with conversation history
    const basePrompt = simulationPrompt({
      scenario: session.scenario,
      persona: session.persona,
    });

    // Build messages array for OpenAI
    const messagesForAI = [
      {
        role: "system" as const,
        content: basePrompt,
      },
      ...existingMessages.map((msg: any) => ({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    // Get AI customer response
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesForAI,
      max_tokens: 300,
      temperature: 0.8, // Higher temperature for natural responses
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      throw new Error("AI did not return a reply");
    }

    // Update messages
    const updatedMessages = [
      ...existingMessages,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ];

    // Update session with new messages
    await prisma.simulationSession.update({
      where: { id: sessionId },
      data: {
        messages: updatedMessages,
      },
    });

    // Evaluate stylist (every 2 messages from stylist to reduce API calls)
    const userMessageCount = updatedMessages.filter(
      (m: any) => m.role === "user"
    ).length;
    let evaluation = null;

    if (userMessageCount >= 2 && userMessageCount % 2 === 0) {
      // Evaluate every 2 stylist messages
      try {
        evaluation = await evaluateStylist(
          updatedMessages,
          session.scenario
        );

        // Update session with latest evaluation
        await prisma.simulationSession.update({
          where: { id: sessionId },
          data: {
            score: evaluation.overallScore,
            feedback: evaluation,
          },
        });

        // Save skill progress from simulation (every evaluation)
        if (evaluation.scores) {
          await saveSkillProgress(
            session.userId,
            evaluation.scores,
            "simulation",
            sessionId
          );
        }
      } catch (evalError) {
        console.error("Evaluation error:", evalError);
        // Continue without evaluation
      }
    }

    return NextResponse.json({
      success: true,
      reply,
      evaluation,
    });
  } catch (err: any) {
    console.error("Simulation chat error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process chat message",
      },
      { status: 500 }
    );
  }
}

