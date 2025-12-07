import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { startOfDay, endOfDay, format, parseISO, isBefore, isAfter } from "date-fns";

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

// GET /api/dashboard/timeline
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

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const now = new Date();

    // Get today's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: todayStart,
          lte: todayEnd,
        },
        ...(user.role === "STYLIST"
          ? {
              staff: {
                userId: user.id,
              },
            }
          : {}),
      },
      include: {
        customer: true,
        staff: {
          include: {
            user: true,
          },
        },
        bookingServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        bookingTime: "asc",
      },
    });

    // Create 30-minute slots from 08:00 to 21:00
    const slots: any[] = [];
    for (let hour = 8; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const slotTime = new Date(today);
        slotTime.setHours(hour, minute, 0, 0);

        // Determine if this is current time slot
        const isCurrentTime =
          isBefore(slotTime, now) &&
          isAfter(new Date(slotTime.getTime() + 30 * 60 * 1000), now);

        slots.push({
          time: timeStr,
          bookings: [],
          isCurrentTime,
        });
      }
    }

    // Assign bookings to slots
    bookings.forEach((booking) => {
      const bookingTime = new Date(booking.bookingTime);
      const bookingStart = format(bookingTime, "HH:mm");
      const bookingEnd = format(
        new Date(bookingTime.getTime() + booking.duration * 60 * 1000),
        "HH:mm"
      );

      // Determine status
      let status: "upcoming" | "in-service" | "completed" | "no-show";
      if (booking.status === "COMPLETED") {
        status = "completed";
      } else if (booking.status === "NO_SHOW") {
        status = "no-show";
      } else if (booking.status === "IN_PROGRESS") {
        status = "in-service";
      } else {
        status = "upcoming";
      }

      const timelineBooking = {
        id: booking.id,
        customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
        serviceName:
          booking.bookingServices[0]?.service?.name || "Dịch vụ",
        stylistName: booking.staff
          ? `${booking.staff.user.firstName} ${booking.staff.user.lastName}`
          : "Chưa phân công",
        startTime: bookingStart,
        endTime: bookingEnd,
        status,
        duration: booking.duration,
      };

      // Find slots that overlap with this booking
      slots.forEach((slot) => {
        const slotTime = parseISO(`2000-01-01T${slot.time}:00`);
        const slotEnd = new Date(slotTime.getTime() + 30 * 60 * 1000);
        const bookingStartTime = parseISO(`2000-01-01T${bookingStart}:00`);
        const bookingEndTime = parseISO(`2000-01-01T${bookingEnd}:00`);

        if (
          (slotTime >= bookingStartTime && slotTime < bookingEndTime) ||
          (slotEnd > bookingStartTime && slotEnd <= bookingEndTime) ||
          (slotTime <= bookingStartTime && slotEnd >= bookingEndTime)
        ) {
          slot.bookings.push(timelineBooking);
        }
      });
    });

    return successResponse(slots);
  } catch (error: any) {
    // Return empty timeline if database fails
    if (error.message?.includes("denied access") || error.message?.includes("ECONNREFUSED") || error.code === "P1001") {
      // Generate empty slots
      const emptySlots: any[] = [];
      for (let hour = 8; hour < 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          emptySlots.push({
            time: timeStr,
            bookings: [],
            isCurrentTime: false,
          });
        }
      }
      return successResponse(emptySlots);
    }
    return errorResponse(error.message || "Failed to get timeline", 500);
  }
}
