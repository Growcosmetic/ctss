// ============================================
// PHASE 28E - Phone Call Automation
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/voice/call/handle - Handle incoming phone call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      callId,
      callerPhone,
      callDirection = "INBOUND",
      branchId,
      partnerId,
    } = body;

    if (!callId || !callerPhone) {
      return errorResponse("Call ID and caller phone are required", 400);
    }

    // Try to find existing customer by phone
    const customer = await prisma.customer.findFirst({
      where: {
        phone: callerPhone,
      },
    });

    // Create voice session for the call
    const session = await prisma.voiceSession.create({
      data: {
        sessionType: "PHONE_CALL",
        channel: "PHONE",
        callId,
        callDirection,
        customerId: customer?.id || null,
        customerPhone: callerPhone,
        customerName: customer?.name || null,
        branchId: branchId || null,
        partnerId: partnerId || null,
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });

    // Generate initial greeting from Mina
    const greetingPrompt = `Bạn là MINA - trợ lý AI của Chí Tâm Hair Salon. Khách vừa gọi điện đến. 
Tạo lời chào ngắn gọn, ấm áp, và hỏi xem khách cần gì. 
${customer?.name ? `Khách hàng là ${customer.name} (khách quen).` : "Đây là khách hàng mới."}
Trả lời trong 2-3 câu, tự nhiên, thân thiện.`;

    const greetingCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là MINA - trợ lý AI của Chí Tâm Hair Salon. Giọng ấm áp, chuyên nghiệp, tự nhiên.",
        },
        {
          role: "user",
          content: greetingPrompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const greetingText = greetingCompletion.choices[0]?.message?.content || 
      "Chào chị yêu, em là Mina của Chí Tâm Hair Salon. Hôm nay em có thể hỗ trợ chị về uốn, nhuộm hay đặt lịch ạ?";

    // Generate audio for greeting
    const greetingAudio = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova", // Mina's voice
      input: greetingText,
      speed: 1.0,
    });

    const audioBuffer = Buffer.from(await greetingAudio.arrayBuffer());

    // Save first interaction
    await prisma.voiceInteraction.create({
      data: {
        sessionId: session.id,
        sequence: 1,
        speaker: "MINA",
        transcript: greetingText,
        responseText: greetingText,
        responseStyle: "FRIENDLY",
        timestamp: new Date(),
      },
    });

    return successResponse({
      sessionId: session.id,
      greeting: greetingText,
      greetingAudio: audioBuffer.toString("base64"),
      customerId: customer?.id,
      customerName: customer?.name,
      requiresHuman: false,
    });
  } catch (error: any) {
    console.error("Error handling phone call:", error);
    return errorResponse(error.message || "Failed to handle call", 500);
  }
}

// PUT /api/voice/call/[sessionId]/process - Process caller response
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return errorResponse("Session ID is required", 400);
    }

    const body = await request.json();
    const { audioUrl, transcript } = body;

    if (!transcript) {
      return errorResponse("Transcript is required", 400);
    }

    // Get session
    const session = await prisma.voiceSession.findUnique({
      where: { id: sessionId },
      include: {
        interactions: {
          orderBy: { sequence: "asc" },
        },
      },
    });

    if (!session) {
      return errorResponse("Session not found", 404);
    }

    // Save customer interaction
    const nextSequence = session.interactions.length + 1;
    const customerInteraction = await prisma.voiceInteraction.create({
      data: {
        sessionId,
        sequence: nextSequence,
        speaker: "CUSTOMER",
        transcript,
        audioUrl: audioUrl || null,
        timestamp: new Date(),
      },
    });

    // Detect intent
    const { voiceIntentPrompt } = await import("@/core/prompts/voiceIntentPrompt");
    const intentPrompt = voiceIntentPrompt(transcript, {
      customerId: session.customerId || undefined,
      sessionType: session.sessionType,
      previousIntents: session.interactions
        .filter(i => i.intent)
        .map(i => i.intent!)
        .slice(-5),
    });

    const intentCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Bạn là AI phân tích ý định khách hàng. Trả về JSON hợp lệ.",
        },
        { role: "user", content: intentPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const intentData = JSON.parse(
      intentCompletion.choices[0]?.message?.content || "{}"
    );

    // Update interaction with intent
    await prisma.voiceInteraction.update({
      where: { id: customerInteraction.id },
      data: {
        intent: intentData.intent,
        entities: intentData.entities || {},
        sentiment: intentData.sentiment,
        emotion: intentData.emotion,
      },
    });

    // Generate response
    const { voiceResponsePrompt } = await import("@/core/prompts/voiceResponsePrompt");
    
    let customerContext: any = {};
    if (session.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: session.customerId },
        include: {
          bookings: { take: 5, orderBy: { date: "desc" } },
          loyalty: { take: 1, orderBy: { createdAt: "desc" } },
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

    const responsePrompt = voiceResponsePrompt(
      intentData.intent,
      intentData.entities || {},
      customerContext,
      {}
    );

    const responseCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Bạn là MINA. Trả lời tự nhiên, ấm áp. Trả về JSON.",
        },
        { role: "user", content: responsePrompt },
      ],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const responseData = JSON.parse(
      responseCompletion.choices[0]?.message?.content || "{}"
    );

    // Generate audio response
    const responseAudio = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova",
      input: responseData.responseText || "",
      speed: 1.0,
    });

    const responseAudioBuffer = Buffer.from(await responseAudio.arrayBuffer());

    // Save Mina's response
    await prisma.voiceInteraction.create({
      data: {
        sessionId,
        sequence: nextSequence + 1,
        speaker: "MINA",
        transcript: responseData.responseText || "",
        responseText: responseData.responseText || "",
        responseStyle: responseData.responseStyle || "FRIENDLY",
        timestamp: new Date(),
      },
    });

    // Handle booking if intent is BOOKING
    let bookingCreated = null;
    if (intentData.intent === "BOOKING" && intentData.entities) {
      // Here you would create the actual booking
      // For now, we'll just return the intent
    }

    // Check if needs human transfer
    const needsHuman = 
      intentData.intent === "COMPLAINT" ||
      intentData.sentiment === "NEGATIVE" ||
      (intentData.intent === "BOOKING" && !intentData.entities?.date && !intentData.entities?.time);

    return successResponse({
      response: responseData.responseText,
      responseAudio: responseAudioBuffer.toString("base64"),
      intent: intentData.intent,
      entities: intentData.entities,
      needsHuman,
      bookingCreated,
    });
  } catch (error: any) {
    console.error("Error processing call:", error);
    return errorResponse(error.message || "Failed to process call", 500);
  }
}

