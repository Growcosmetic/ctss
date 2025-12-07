import { NextRequest } from "next/server";
import { triggerAfterPayment } from "@/features/notifications/services/notificationTriggers";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/notifications/trigger/after-payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, invoiceId } = body;

    if (!customerId || !invoiceId) {
      return errorResponse("customerId and invoiceId are required", 400);
    }

    await triggerAfterPayment(customerId, invoiceId);

    return successResponse(null, "After payment notification triggered");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to trigger notification", 500);
  }
}

