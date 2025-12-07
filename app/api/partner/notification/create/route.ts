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

// POST /api/partner/notification/create
export async function POST(request: NextRequest) {
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

    if (!user || user.role !== "ADMIN") {
      return errorResponse("Only HQ can create notifications", 403);
    }

    const body = await request.json();
    const { 
      partnerId, // null = broadcast to all
      type,
      priority = "MEDIUM",
      title,
      message,
      actionUrl,
      recipients // Array of user IDs or roles
    } = body;

    if (!title || !message) {
      return errorResponse("Title and message are required", 400);
    }

    if (!partnerId) {
      // Broadcast to all partners
      const partners = await prisma.partner.findMany({
        where: { isActive: true },
      });

      const notifications = [];
      for (const partner of partners) {
        const notification = await prisma.hQNotification.create({
          data: {
            partnerId: partner.id,
            type: type || "SYSTEM_UPDATE",
            priority,
            title,
            message,
            actionUrl,
            recipients: recipients || null,
          },
        });
        notifications.push(notification);
      }

      return successResponse(
        { count: notifications.length, notifications },
        `Notification sent to ${notifications.length} partners`,
        201
      );
    } else {
      // Send to specific partner
      const notification = await prisma.hQNotification.create({
        data: {
          partnerId,
          type: type || "SYSTEM_UPDATE",
          priority,
          title,
          message,
          actionUrl,
          recipients: recipients || null,
        },
      });

      return successResponse(notification, "Notification created successfully", 201);
    }
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return errorResponse(error.message || "Failed to create notification", 500);
  }
}

