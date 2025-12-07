// ============================================
// Channel Intake API
// Unified endpoint for all messaging channels
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeChannelMessage } from "@/core/channel/normalizer";
import { routeMessage } from "@/core/channel/messageRouter";
import { runWorkflow } from "@/core/aiWorkflow/runWorkflow";
import { processJourneyEvent } from "@/core/customerJourney/transitionEngine";
import type { UnifiedMessage, ChannelWebhookPayload } from "@/core/channel/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1) Normalize message from any channel
    const unified: UnifiedMessage = normalizeChannelMessage(
      body as ChannelWebhookPayload
    );

    // 2) Get or create customer profile
    // Try to find by phone first, then by platform customerId
    let profile = await prisma.customerProfile.findFirst({
      where: unified.phone
        ? { phone: unified.phone }
        : {
            OR: [
              { phone: unified.customerId },
              // Can add platform-specific lookup here if needed
            ],
          },
    });

    // If no profile found, try to find customer by phone
    let customerId: string | null = null;
    if (!profile && unified.phone) {
      const customer = await prisma.customer.findUnique({
        where: { phone: unified.phone },
        select: { id: true },
      });
      if (customer) {
        customerId = customer.id;
      }
    }

    // Create or update profile
    if (!profile) {
      // Try to create customer if phone exists
      if (unified.phone && !customerId) {
        const newCustomer = await prisma.customer.upsert({
          where: { phone: unified.phone },
          update: {},
          create: {
            phone: unified.phone,
            name: unified.metadata?.name || "Khách hàng",
          },
        });
        customerId = newCustomer.id;
      }

      // Create profile
      if (customerId || unified.phone) {
        profile = await prisma.customerProfile.create({
          data: {
            customerId: customerId || unified.customerId,
            phone: unified.phone || null,
            name: unified.metadata?.name || null,
            journeyState: "AWARENESS",
            chatHistory: [
              {
                from: unified.platform,
                message: unified.message,
                timestamp: unified.timestamp,
                attachments: unified.attachments,
              },
            ],
          },
        });
      }
    } else {
      // Update existing profile with chat history
      const chatHistory = Array.isArray(profile.chatHistory)
        ? (profile.chatHistory as any[])
        : [];

      await prisma.customerProfile.update({
        where: { id: profile.id },
        data: {
          chatHistory: [
            ...chatHistory,
            {
              from: unified.platform,
              message: unified.message,
              timestamp: unified.timestamp,
              attachments: unified.attachments,
            },
          ],
          updatedAt: new Date(),
        },
      });
    }

    if (!profile) {
      throw new Error("Failed to create or retrieve customer profile");
    }

    // 3) Route message to appropriate workflow
    const routing = routeMessage(unified);

    // 4) Run AI workflow
    const workflowPayload: any = {
      customerId: profile.customerId,
      phone: profile.phone || unified.phone,
      message: unified.message,
      platform: unified.platform,
      intent: routing.intent,
    };

    // Add specific payload based on workflow type
    if (routing.workflowType === "stylist-coach") {
      // Extract hair info from message if present
      workflowPayload.hairCondition = unified.message;
    }

    const aiResult = await runWorkflow(routing.workflowType, workflowPayload);

    // 5) Auto-transition journey state based on intent
    if (profile.customerId) {
      const journeyEvent = getJourneyEventFromIntent(routing.intent);
      if (journeyEvent) {
        processJourneyEvent({
          customerId: profile.customerId,
          event: journeyEvent,
          metadata: {
            platform: unified.platform,
            message: unified.message,
          },
        }).catch((err) => {
          console.error("Failed to transition journey:", err);
        });
      }
    }

    // 6) Extract reply from AI result
    let reply = "";
    if (typeof aiResult === "string") {
      reply = aiResult;
    } else if (aiResult?.output?.text) {
      reply = aiResult.output.text;
    } else if (aiResult?.output?.reply) {
      reply = aiResult.output.reply;
    } else if (aiResult?.reply) {
      reply = aiResult.reply;
    } else if (aiResult?.aiGeneratedProcess) {
      reply = aiResult.aiGeneratedProcess;
    } else if (aiResult?.insightSummary) {
      reply = aiResult.insightSummary;
    } else {
      // Fallback: try to extract any text field
      reply = JSON.stringify(aiResult).slice(0, 500);
    }

    return NextResponse.json({
      success: true,
      reply,
      customerId: profile.customerId,
      workflowType: routing.workflowType,
      intent: routing.intent,
    });
  } catch (error: any) {
    console.error("Channel intake error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process message",
        reply: "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
      },
      { status: 500 }
    );
  }
}

// ============================================
// Map Intent to Journey Event
// ============================================

function getJourneyEventFromIntent(intent: string): string | null {
  const intentMap: Record<string, string> = {
    general_inquiry: "customer-asks-question",
    booking_request: "customer-requests-booking",
    technical_consultation: "customer-asks-question",
    sop_inquiry: "customer-asks-question",
  };

  return intentMap[intent] || null;
}

