import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { NotificationType } from "@/features/notifications/types";

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

// POST /api/notifications/create (Internal tool)
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

    // Check if user is admin or manager (only they can create notifications)
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return errorResponse("Unauthorized - Only admin/manager can create notifications", 403);
    }

    const body = await request.json();
    const { userId, type, title, message, data } = body;

    if (!userId || !type || !title || !message) {
      return errorResponse("userId, type, title, and message are required", 400);
    }

    // Validate notification type
    if (!Object.values(NotificationType).includes(type)) {
      return errorResponse("Invalid notification type", 400);
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {},
        status: "UNREAD",
      },
    });

    return successResponse(notification, "Notification created successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to create notification", 500);
  }
}

