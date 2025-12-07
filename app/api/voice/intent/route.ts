// ============================================
// PHASE 28C - AI Intent Detection
// ============================================

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { voiceIntentPrompt } from "@/core/prompts/voiceIntentPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/voice/intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, sessionId, interactionId } = body;

    if (!transcript) {
      return errorResponse("Transcript is required", 400);
    }

    // Get session context if available
    let context: any = {};
    if (sessionId) {
      const session = await prisma.voiceSession.findUnique({
        where: { id: sessionId },
        include: {
          interactions: {
            orderBy: { sequence: "desc" },
            take: 5,
          },
        },
      });

      if (session) {
        context = {
          customerId: session.customerId,
          sessionType: session.sessionType,
          previousIntents: session.interactions
            .map(i => i.intent)
            .filter(Boolean),
        };
      }
    }

    // Generate prompt
    const prompt = voiceIntentPrompt(transcript, context);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chuyên phân tích ý định khách hàng. Trả về JSON hợp lệ chính xác.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not return intent", 500);
    }

    // Parse JSON
    let intentData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      intentData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse intent JSON:", parseError);
      return errorResponse("Failed to parse intent response", 500);
    }

    // Save intent if interactionId provided
    if (interactionId) {
      await prisma.voiceIntent.create({
        data: {
          intent: intentData.intent,
          confidence: intentData.confidence || 0.5,
          interactionId,
          sessionId: sessionId || undefined,
          entities: intentData.entities || {},
        },
      });

      // Update interaction with intent
      await prisma.voiceInteraction.update({
        where: { id: interactionId },
        data: {
          intent: intentData.intent,
          entities: intentData.entities || {},
          sentiment: intentData.sentiment,
          emotion: intentData.emotion,
        },
      });
    }

    return successResponse(intentData);
  } catch (error: any) {
    console.error("Error detecting intent:", error);
    return errorResponse(error.message || "Failed to detect intent", 500);
  }
}

