import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

// Simple token validation
function validateToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    return userId || null;
  } catch {
    return null;
  }
}

// GET /api/notifications?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const currentUserId = validateToken(token);
    if (!currentUserId) {
      return errorResponse("Invalid token", 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || currentUserId;
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Get notifications
    const where: any = { userId };
    if (unreadOnly) {
      where.status = "UNREAD";
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        status: "UNREAD",
      },
    });

    return successResponse({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    // Return empty notifications if database fails
    if (error.message?.includes("denied access") || error.message?.includes("ECONNREFUSED") || error.code === "P1001") {
      return successResponse({
        notifications: [],
        unreadCount: 0,
      });
    }
    return errorResponse(error.message || "Failed to get notifications", 500);
  }
}

