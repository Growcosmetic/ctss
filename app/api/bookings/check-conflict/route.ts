import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { parseISO } from "date-fns";
import { checkBookingConflicts } from "@/lib/bookingUtils";
import { prisma } from "@/lib/prisma";
import { requireSalonId } from "@/lib/api-helpers";

// POST /api/bookings/check-conflict - Check if a booking time conflicts
export async function POST(request: NextRequest) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);
    
    const body = await request.json();
    const {
      staffId,
      bookingDate,
      bookingTime,
      duration,
      bufferTime = 10,
      excludeBookingId,
    } = body;

    // Validation
    if (!staffId || !bookingDate || !bookingTime) {
      return errorResponse("Staff ID, booking date, and time are required", 400);
    }

    // Verify staff belongs to current salon
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      select: { salonId: true },
    });

    if (!staff) {
      return errorResponse("Staff not found", 404);
    }

    if (staff.salonId !== salonId) {
      return errorResponse("Access denied: Staff does not belong to your salon", 403);
    }

    // Get duration from service if not provided
    let totalDuration = duration;
    if (!totalDuration) {
      totalDuration = 60; // Default 60 minutes
    }

    // Parse booking date and time
    const startDateTime = parseISO(`${bookingDate}T${bookingTime}`);
    const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60 * 1000);

    // Validate buffer time
    const bufferMinutes = Math.max(0, Math.min(60, Number(bufferTime) || 10));

    // Check for conflicts
    const conflicts = await checkBookingConflicts(
      staffId,
      startDateTime,
      endDateTime,
      bufferMinutes,
      excludeBookingId
    );

    if (conflicts) {
      return errorResponse(
        `Khung giờ này đã được đặt (có buffer ${bufferMinutes} phút). Vui lòng chọn thời gian khác.`,
        409
      );
    }

    return successResponse({ hasConflict: false }, "No conflicts found");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to check conflicts", 500);
  }
}

