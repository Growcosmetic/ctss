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

// POST /api/notifications/mark-read
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read for current user
      await prisma.notification.updateMany({
        where: {
          userId: currentUserId,
          status: "UNREAD",
        },
        data: {
          status: "READ",
          readAt: new Date(),
        },
      });

      return successResponse(null, "All notifications marked as read");
    }

    if (!notificationId) {
      return errorResponse("notificationId is required", 400);
    }

    // Mark single notification as read
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return errorResponse("Notification not found", 404);
    }

    if (notification.userId !== currentUserId) {
      return errorResponse("Unauthorized", 403);
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    return successResponse(null, "Notification marked as read");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to mark notification as read", 500);
  }
}

