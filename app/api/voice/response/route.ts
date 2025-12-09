// ============================================
// PHASE 28D - Voice Response Generation
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { voiceResponsePrompt } from "@/core/prompts/voiceResponsePrompt";

// Client initialized lazily via getClient()

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/voice/response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      intent,
      entities,
      sessionId,
      interactionId,
      includeAudio = false,
    } = body;

    if (!intent) {
      return errorResponse("Intent is required", 400);
    }

    // Get customer context
    let customerContext: any = {};
    let salonContext: any = {};

    if (sessionId) {
      const session = await prisma.voiceSession.findUnique({
        where: { id: sessionId },
        include: {
          interactions: {
            orderBy: { sequence: "desc" },
            take: 1,
          },
        },
      });

      if (session?.customerId) {
        const customer = await prisma.customer.findUnique({
          where: { id: session.customerId },
          include: {
            bookings: {
              take: 5,
              orderBy: { date: "desc" },
            },
            loyalty: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        });

        if (customer) {
          customerContext = {
            name: customer.name,
            previousBookings: customer.bookings.length,
            loyaltyLevel: customer.loyalty[0]?.level || "BRONZE",
          };
        }
      }

      // Get available slots if booking intent
      if (intent === "BOOKING" && entities?.date) {
        // This would query actual available slots
        // For now, we'll provide example slots
        salonContext.availableSlots = [
          { date: entities.date, time: "13:30", stylist: entities.stylist },
          { date: entities.date, time: "15:15", stylist: entities.stylist },
        ];
      }

      // Get services if price inquiry
      if (intent === "PRICE_INQUIRY") {
        const services = await prisma.service.findMany({
          where: {
            name: {
              contains: entities?.service || "",
              mode: "insensitive",
            },
          },
          select: { name: true, price: true },
          take: 5,
        });
        salonContext.services = services;
      }
    }

    // Generate prompt
    const prompt = voiceResponsePrompt(
      intent,
      entities || {},
      customerContext,
      salonContext
    );

    // Call OpenAI
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là MINA - trợ lý AI của Chí Tâm Hair Salon. Trả lời tự nhiên, ấm áp, chuyên nghiệp. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8, // Higher for more natural responses
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate response", 500);
    }

    // Parse JSON
    let responseData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      responseData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse response JSON:", parseError);
      return errorResponse("Failed to parse response", 500);
    }

    // Generate audio if requested
    let audioUrl = null;
    if (includeAudio) {
      try {
        const mp3 = await getClient().audio.speech.create({
          model: "tts-1-hd",
          voice: "nova", // Mina's voice
          input: responseData.responseText,
          speed: 1.0,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        // In production, upload to storage and get URL
        // For now, we'll return the buffer as base64
        audioUrl = buffer.toString("base64");
      } catch (audioError: any) {
        console.error("Error generating audio:", audioError);
        // Continue without audio
      }
    }

    // Update interaction if interactionId provided
    if (interactionId) {
      await prisma.voiceInteraction.update({
        where: { id: interactionId },
        data: {
          responseText: responseData.responseText,
          responseStyle: responseData.responseStyle || "FRIENDLY",
        },
      });
    }

    return successResponse({
      ...responseData,
      audioUrl,
    });
  } catch (error: any) {
    console.error("Error generating response:", error);
    return errorResponse(error.message || "Failed to generate response", 500);
  }
}

