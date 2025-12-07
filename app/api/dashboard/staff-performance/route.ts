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

// GET /api/dashboard/staff-performance
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

    // Get all active staff
    const staffList = await prisma.staff.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Get today's bookings grouped by staff
    const todayBookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: todayStart,
          lte: todayEnd,
        },
        staffId: {
          not: null,
        },
      },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
        invoice: {
          where: {
            status: "PAID",
          },
        },
      },
    });

    // Calculate performance for each staff
    const performanceMap = new Map<string, any>();

    // Initialize all staff
    staffList.forEach((staff) => {
      performanceMap.set(staff.id, {
        staffId: staff.id,
        name: `${staff.user.firstName} ${staff.user.lastName}`,
        avatar: staff.user.avatar,
        bookingsToday: 0,
        revenueToday: 0,
        completedBookings: 0,
        totalBookingMinutes: 0,
      });
    });

    // Aggregate from bookings
    todayBookings.forEach((booking) => {
      if (!booking.staffId) return;

      const perf = performanceMap.get(booking.staffId);
      if (!perf) return;

      perf.bookingsToday++;
      if (booking.status === "COMPLETED") {
        perf.completedBookings++;
      }
      perf.totalBookingMinutes += booking.duration;

      // Add revenue from invoice
      if (booking.invoice) {
        perf.revenueToday += Number(booking.invoice.total);
      }
    });

    // Calculate workload percentage (assuming 8-hour workday = 480 minutes)
    const workingHours = 8 * 60; // 480 minutes
    const performance: any[] = Array.from(performanceMap.values()).map(
      (perf) => ({
        ...perf,
        workloadPercentage: Math.min(
          100,
          Math.round((perf.totalBookingMinutes / workingHours) * 100)
        ),
      })
    );

    // Filter by role: Stylist only sees their own data
    if (user.role === "STYLIST") {
      const staff = await prisma.staff.findUnique({
        where: { userId: user.id },
      });
      if (staff) {
        const ownPerf = performance.find((p) => p.staffId === staff.id);
        return successResponse(ownPerf ? [ownPerf] : []);
      }
      return successResponse([]);
    }

    return successResponse(performance);
  } catch (error: any) {
    // Return empty array if database fails
    if (error.message?.includes("denied access") || error.message?.includes("ECONNREFUSED") || error.code === "P1001") {
      return successResponse([]);
    }
    return errorResponse(error.message || "Failed to get staff performance", 500);
  }
}
