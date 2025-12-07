import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { startOfDay, endOfDay } from "date-fns";

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

// GET /api/staff/today-bookings
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
      include: {
        staff: true,
      },
    });

    if (!user || !user.staff) {
      return errorResponse("Staff not found", 404);
    }

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const bookings = await prisma.booking.findMany({
      where: {
        staffId: user.staff.id,
        bookingDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        customer: true,
        bookingServices: {
          include: {
            service: true,
          },
        },
        invoice: {
          select: {
            total: true,
          },
        },
      },
      orderBy: {
        bookingTime: "asc",
      },
    });

    const staffBookings = bookings.map((booking) => ({
      id: booking.id,
      customerId: booking.customerId,
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customerPhone: booking.customer.phone,
      serviceName: booking.bookingServices[0]?.service?.name || "Dịch vụ",
      serviceId: booking.bookingServices[0]?.serviceId || "",
      bookingTime: booking.bookingTime.toISOString(),
      duration: booking.duration,
      status: booking.status as "UPCOMING" | "IN_SERVICE" | "COMPLETED" | "NO_SHOW",
      notes: booking.notes || undefined,
      totalAmount: booking.invoice ? Number(booking.invoice.total) : undefined,
    }));

    return successResponse(staffBookings);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get today bookings", 500);
  }
}

