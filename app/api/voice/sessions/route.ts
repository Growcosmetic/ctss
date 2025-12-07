// ============================================
// PHASE 28G - Voice Sessions List
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

function validateToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

// GET /api/voice/sessions - List voice sessions
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

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const branchId = searchParams.get("branchId") || undefined;
    const partnerId = searchParams.get("partnerId") || undefined;
    const sessionType = searchParams.get("sessionType") || undefined;
    const status = searchParams.get("status") || undefined;
    const customerPhone = searchParams.get("customerPhone") || undefined;

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (partnerId) where.partnerId = partnerId;
    if (sessionType) where.sessionType = sessionType;
    if (status) where.status = status;
    if (customerPhone) where.customerPhone = { contains: customerPhone };

    // Apply role-based filtering
    if (user.role !== "ADMIN" && user.partnerId) {
      where.partnerId = user.partnerId;
    }
    if (user.role === "STYLIST" && user.branchId) {
      where.branchId = user.branchId;
    }

    const [sessions, total] = await Promise.all([
      prisma.voiceSession.findMany({
        where,
        include: {
          interactions: {
            take: 5,
            orderBy: { sequence: "asc" },
          },
        },
        orderBy: { startedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.voiceSession.count({ where }),
    ]);

    return successResponse({
      sessions: sessions.map(s => ({
        id: s.id,
        sessionType: s.sessionType,
        channel: s.channel,
        customerId: s.customerId,
        customerName: s.customerName,
        customerPhone: s.customerPhone,
        staffId: s.staffId,
        branchId: s.branchId,
        partnerId: s.partnerId,
        status: s.status,
        intent: s.intent,
        resolved: s.resolved,
        actionTaken: s.actionTaken,
        duration: s.duration,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        interactionCount: s.interactions.length,
        summary: s.summary,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching voice sessions:", error);
    return errorResponse(error.message || "Failed to fetch sessions", 500);
  }
}

