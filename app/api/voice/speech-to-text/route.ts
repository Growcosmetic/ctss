// ============================================
// PHASE 28B - Speech-to-Text Engine
// ============================================

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/voice/speech-to-text
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const sessionId = formData.get("sessionId") as string | null;
    const language = (formData.get("language") as string) || "vi";

    if (!audioFile) {
      return errorResponse("Audio file is required", 400);
    }

    // Convert File to Buffer for OpenAI
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a File-like object for OpenAI
    const file = new File([buffer], audioFile.name, { type: audioFile.type });

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: language === "vi" ? "vi" : undefined,
      response_format: "verbose_json",
    });

    const transcript = transcription.text;

    // Save interaction if sessionId provided
    if (sessionId) {
      const session = await prisma.voiceSession.findUnique({
        where: { id: sessionId },
      });

      if (session) {
        // Get next sequence number
        const lastInteraction = await prisma.voiceInteraction.findFirst({
          where: { sessionId },
          orderBy: { sequence: "desc" },
        });

        const nextSequence = lastInteraction ? lastInteraction.sequence + 1 : 1;

        // Save audio file URL (you'd need to upload to storage in production)
        // For now, we'll save the transcript only
        await prisma.voiceInteraction.create({
          data: {
            sessionId,
            sequence: nextSequence,
            speaker: "CUSTOMER",
            transcript,
            language: transcription.language || language,
            timestamp: new Date(),
            duration: transcription.duration || undefined,
          },
        });
      }
    }

    return successResponse({
      transcript,
      language: transcription.language || language,
      duration: transcription.duration,
      words: transcription.words || [],
    });
  } catch (error: any) {
    console.error("Error in speech-to-text:", error);
    return errorResponse(error.message || "Failed to transcribe audio", 500);
  }
}

