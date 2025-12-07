// ============================================
// Training Simulation - End Session
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateStylist } from "@/core/scoring/evaluateStylist";
import { saveSkillProgress } from "@/core/scoring/addSkillProgress";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Get session
    const session = await prisma.simulationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Final evaluation
    const messages = (session.messages as any[]) || [];
    const evaluation = await evaluateStylist(messages, session.scenario);

    // Update session with final evaluation
    const updatedSession = await prisma.simulationSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        score: evaluation.overallScore,
        feedback: evaluation,
      },
    });

    // Save skill progress from simulation
    if (evaluation.scores) {
      await saveSkillProgress(
        session.userId,
        evaluation.scores,
        "simulation",
        sessionId
      );
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
      evaluation,
    });
  } catch (err: any) {
    console.error("End simulation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to end simulation",
      },
      { status: 500 }
    );
  }
}

