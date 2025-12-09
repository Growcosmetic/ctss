// ============================================
// PHASE 28G - Voice Dashboard & Analytics
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

function validateToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

// GET /api/voice/dashboard - Get voice analytics dashboard
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return errorResponse("Access denied", 403);
    }

    const { searchParams } = new URL(request.url);
    const periodStart = searchParams.get("periodStart")
      ? new Date(searchParams.get("periodStart")!)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodEnd = searchParams.get("periodEnd")
      ? new Date(searchParams.get("periodEnd")!)
      : new Date();
    const branchId = searchParams.get("branchId") || undefined;
    const partnerId = searchParams.get("partnerId") || undefined;

    // Get sessions
    const sessions = await prisma.voiceSession.findMany({
      where: {
        startedAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      include: {
        interactions: true,
      },
    });

    // Calculate metrics
    const totalSessions = sessions.length;
    const totalInteractions = sessions.reduce(
      (sum, s) => sum + s.interactions.length,
      0
    );
    const avgDuration =
      sessions.filter(s => s.duration).length > 0
        ? sessions
            .filter(s => s.duration)
            .reduce((sum, s) => sum + (s.duration || 0), 0) /
          sessions.filter(s => s.duration).length
        : 0;
    const avgInteractions = totalSessions > 0 ? totalInteractions / totalSessions : 0;

    // Intent breakdown
    const intentCounts: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.intent) {
        intentCounts[session.intent] = (intentCounts[session.intent] || 0) + 1;
      }
      session.interactions.forEach(interaction => {
        if (interaction.intent) {
          intentCounts[interaction.intent] = (intentCounts[interaction.intent] || 0) + 1;
        }
      });
    });

    // Resolution metrics
    const resolvedSessions = sessions.filter(s => s.resolved).length;
    const resolutionRate = totalSessions > 0 ? (resolvedSessions / totalSessions) * 100 : 0;

    const bookingSessions = sessions.filter(
      s => s.actionTaken === "BOOKING_CREATED"
    ).length;
    const bookingRate = totalSessions > 0 ? (bookingSessions / totalSessions) * 100 : 0;

    // Sentiment analysis
    const sentiments = sessions.flatMap(s =>
      s.interactions.map(i => i.sentiment).filter(Boolean)
    );
    const positiveCount = sentiments.filter(s => s === "POSITIVE").length;
    const negativeCount = sentiments.filter(s => s === "NEGATIVE").length;
    const avgSentiment =
      sentiments.length > 0
        ? (positiveCount - negativeCount) / sentiments.length
        : 0;
    const positiveRate =
      sentiments.length > 0 ? (positiveCount / sentiments.length) * 100 : 0;

    // Phone call metrics
    const phoneSessions = sessions.filter(s => s.sessionType === "PHONE_CALL");
    const totalCalls = phoneSessions.length;
    const avgCallDuration =
      phoneSessions.filter(s => s.duration).length > 0
        ? phoneSessions
            .filter(s => s.duration)
            .reduce((sum, s) => sum + (s.duration || 0), 0) /
          phoneSessions.filter(s => s.duration).length
        : 0;
    const transferRate =
      totalCalls > 0
        ? (phoneSessions.filter(s => s.transferToHuman).length / totalCalls) * 100
        : 0;

    // Voice command metrics
    const commands = await prisma.voiceCommand.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        ...(branchId ? { branchId } : {}),
      },
    });

    const totalCommands = commands.length;
    const successfulCommands = commands.filter(c => c.status === "COMPLETED").length;
    const commandSuccessRate =
      totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0;

    // Recent sessions
    const recentSessions = await prisma.voiceSession.findMany({
      where: {
        startedAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        ...(branchId ? { branchId } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      include: {
        interactions: {
          take: 3,
          orderBy: { sequence: "asc" },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    // Top intents
    const topIntents = Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([intent, count]) => ({ intent, count }));

    return successResponse({
      overview: {
        totalSessions,
        totalInteractions,
        avgDuration: Math.round(avgDuration),
        avgInteractions: Math.round(avgInteractions * 100) / 100,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        bookingRate: Math.round(bookingRate * 100) / 100,
        positiveRate: Math.round(positiveRate * 100) / 100,
        avgSentiment: Math.round(avgSentiment * 100) / 100,
      },
      phoneCalls: {
        totalCalls,
        avgCallDuration: Math.round(avgCallDuration),
        transferRate: Math.round(transferRate * 100) / 100,
      },
      voiceCommands: {
        totalCommands,
        commandSuccessRate: Math.round(commandSuccessRate * 100) / 100,
      },
      intentBreakdown: intentCounts,
      topIntents,
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        sessionType: s.sessionType,
        customerName: s.customerName,
        customerPhone: s.customerPhone,
        intent: s.intent,
        resolved: s.resolved,
        duration: s.duration,
        startedAt: s.startedAt,
        interactionCount: s.interactions.length,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching voice dashboard:", error);
    return errorResponse(error.message || "Failed to fetch dashboard", 500);
  }
}

