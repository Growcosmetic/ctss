// ============================================
// PHASE 28 - Create Voice Session
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/voice/session/create
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionType, // PHONE_CALL | VOICE_MESSAGE | INTERCOM | CHAT_VOICE
      channel, // PHONE | ZALO | FACEBOOK | WEBSITE | IN_PERSON
      customerId,
      customerPhone,
      customerName,
      staffId,
      branchId,
      partnerId,
      callId,
      callDirection, // INBOUND | OUTBOUND
    } = body;

    if (!sessionType) {
      return errorResponse("Session type is required", 400);
    }

    // Create session
    const session = await prisma.voiceSession.create({
      data: {
        sessionType,
        channel: channel || null,
        customerId: customerId || null,
        customerPhone: customerPhone || null,
        customerName: customerName || null,
        staffId: staffId || null,
        branchId: branchId || null,
        partnerId: partnerId || null,
        callId: callId || null,
        callDirection: callDirection || null,
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });

    return successResponse(session, "Session created", 201);
  } catch (error: any) {
    console.error("Error creating voice session:", error);
    return errorResponse(error.message || "Failed to create session", 500);
  }
}

// PUT /api/voice/session/[id] - Update session
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      return errorResponse("Session ID is required", 400);
    }

    const body = await request.json();
    const { status, summary, intent, resolved, actionTaken, endedAt } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (summary) updateData.summary = summary;
    if (intent) updateData.intent = intent;
    if (resolved !== undefined) updateData.resolved = resolved;
    if (actionTaken) updateData.actionTaken = actionTaken;
    if (endedAt) updateData.endedAt = new Date(endedAt);

    // Calculate duration if ending
    if (status === "COMPLETED" || endedAt) {
      const session = await prisma.voiceSession.findUnique({
        where: { id: sessionId },
      });

      if (session) {
        const endTime = endedAt ? new Date(endedAt) : new Date();
        const duration = Math.floor(
          (endTime.getTime() - session.startedAt.getTime()) / 1000
        );
        updateData.duration = duration;
        if (!endedAt) updateData.endedAt = endTime;
      }
    }

    const updatedSession = await prisma.voiceSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return successResponse(updatedSession);
  } catch (error: any) {
    console.error("Error updating voice session:", error);
    return errorResponse(error.message || "Failed to update session", 500);
  }
}

