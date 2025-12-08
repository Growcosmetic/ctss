import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

// Simple token validation
function validateCustomerToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [customerId] = decoded.split(":");
    return customerId || null;
  } catch {
    return null;
  }
}

// GET /api/customer/notifications
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const customerId = validateCustomerToken(token);
    if (!customerId) {
      return errorResponse("Invalid token", 401);
    }

    // For now, we'll return notifications from reminder jobs and system notifications
    // In production, you'd have a CustomerNotification model
    const bookings = await prisma.booking.findMany({
      where: {
        customerId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
      take: 5,
    });

    const notifications = bookings.map((booking) => ({
      id: `booking-${booking.id}`,
      type: "BOOKING_REMINDER",
      title: "Nhắc nhở lịch hẹn",
        message: `Bạn có lịch hẹn vào ${booking.date.toLocaleString("vi-VN")}`,
      data: {
        bookingId: booking.id,
      },
      createdAt: booking.date, // Use booking date as createdAt
      isRead: false,
    }));

    return successResponse(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return errorResponse(error.message || "Failed to fetch notifications", 500);
  }
}

