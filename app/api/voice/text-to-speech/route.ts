// ============================================
// PHASE 28D - Text-to-Speech (Mina Voice)
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Client initialized lazily via getClient()

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/voice/text-to-speech
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, sessionId, voice = "nova", speed = 1.0 } = body;

    if (!text) {
      return errorResponse("Text is required", 400);
    }

    // OpenAI TTS API supports: alloy, echo, fable, onyx, nova, shimmer
    // We use "nova" for Mina's voice (warm, feminine)
    const mp3 = await getClient().audio.speech.create({
      model: "tts-1-hd", // High quality voice
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
      speed: Math.max(0.25, Math.min(4.0, speed)), // Clamp between 0.25 and 4.0
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Save interaction if sessionId provided
    if (sessionId) {
      const session = await prisma.voiceSession.findUnique({
        where: { id: sessionId },
      });

      if (session) {
        const lastInteraction = await prisma.voiceInteraction.findFirst({
          where: { sessionId },
          orderBy: { sequence: "desc" },
        });

        const nextSequence = lastInteraction ? lastInteraction.sequence + 1 : 1;

        // In production, upload buffer to storage and get URL
        // For now, we'll save without audio URL
        await prisma.voiceInteraction.create({
          data: {
            sessionId,
            sequence: nextSequence,
            speaker: "MINA",
            transcript: text,
            responseText: text,
            responseAudioUrl: null, // Would be storage URL in production
            responseStyle: "FRIENDLY",
            timestamp: new Date(),
          },
        });
      }
    }

    // Return audio as response
    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error in text-to-speech:", error);
    return errorResponse(error.message || "Failed to generate speech", 500);
  }
}

