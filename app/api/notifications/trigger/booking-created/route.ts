import { NextRequest } from "next/server";
import { triggerBookingCreated } from "@/features/notifications/services/notificationTriggers";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/notifications/trigger/booking-created
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return errorResponse("bookingId is required", 400);
    }

    await triggerBookingCreated(bookingId);

    return successResponse(null, "Booking created notification triggered");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to trigger notification", 500);
  }
}

