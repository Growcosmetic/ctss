// ============================================
// PHASE 31E - Smart Follow-up System
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { personalizedFollowUpPrompt } from "@/core/prompts/personalizedFollowUpPrompt";
// Helper function to get relevant memories
async function getRelevantMemories(
  customerId: string,
  context: string
): Promise<any[]> {
  try {
    const memories = await prisma.minaMemory.findMany({
      where: {
        customerId,
        confidence: { gte: 0.5 }, // Only high-confidence memories
      },
      orderBy: [
        { confidence: "desc" },
        { lastUsed: "desc" },
      ],
      take: 10,
    });

    return memories;
  } catch (error) {
    console.error("Error getting relevant memories:", error);
    return [];
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/personalization/followup - Generate personalized follow-up
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      bookingId,
      serviceId,
      followUpType = "POST_SERVICE",
      priority = "MEDIUM",
    } = body;

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    // Get customer profile
    const customerProfile = await prisma.customerPersonalityProfile.findUnique({
      where: { customerId },
    });

    if (!customerProfile) {
      return errorResponse("Customer profile not found", 404);
    }

    // Get booking/service context
    let serviceType = null;
    let serviceDate = null;
    let previousFeedback = null;

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true },
      });
      if (booking) {
        serviceType = booking.service?.name || null;
        serviceDate = booking.date;
      }
    }

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (service) {
        serviceType = service.name;
      }
    }

    // Get relevant memories
    const memories = await getRelevantMemories(customerId, followUpType);

    // Get previous feedback if available
    const feedback = await prisma.feedback?.findFirst({
      where: {
        customerId,
        bookingId: bookingId || undefined,
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => null);

    previousFeedback = feedback?.comment || null;

    // Generate prompt
    const prompt = personalizedFollowUpPrompt(customerProfile, {
      serviceType,
      serviceDate,
      previousFeedback,
      followUpType,
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là MINA - trợ lý AI cá nhân hóa. Tạo follow-up message ấm áp, phù hợp với tính cách khách. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate follow-up", 500);
    }

    // Parse JSON
    let followUpData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      followUpData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse follow-up JSON:", parseError);
      return errorResponse("Failed to parse follow-up response", 500);
    }

    // Calculate scheduled time (e.g., 1 day after service for POST_SERVICE)
    let scheduledAt: Date | null = null;
    if (followUpType === "POST_SERVICE" && serviceDate) {
      scheduledAt = new Date(serviceDate);
      scheduledAt.setDate(scheduledAt.getDate() + 1); // Next day
    }

    // Save follow-up
    const followUp = await prisma.personalizedFollowUp.create({
      data: {
        customerId,
        bookingId: bookingId || null,
        serviceId: serviceId || null,
        followUpType,
        priority,
        tone: followUpData.tone || null,
        length: followUpData.length || null,
        content: followUpData.content,
        scheduledAt,
        aiGenerated: true,
        personalizationFactors: followUpData.personalizationFactors || null,
      },
    });

    return successResponse(followUp);
  } catch (error: any) {
    console.error("Error generating follow-up:", error);
    return errorResponse(error.message || "Failed to generate follow-up", 500);
  }
}

// GET /api/personalization/followup - Get follow-ups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status") || "PENDING";

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    const followUps = await prisma.personalizedFollowUp.findMany({
      where: {
        customerId,
        status,
      },
      orderBy: { scheduledAt: "asc" },
    });

    return successResponse(followUps);
  } catch (error: any) {
    console.error("Error fetching follow-ups:", error);
    return errorResponse(error.message || "Failed to fetch follow-ups", 500);
  }
}

