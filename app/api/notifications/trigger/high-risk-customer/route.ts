import { NextRequest } from "next/server";
import { triggerHighRiskCustomer } from "@/features/notifications/services/notificationTriggers";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/notifications/trigger/high-risk-customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    await triggerHighRiskCustomer(customerId);

    return successResponse(null, "High-risk customer notification triggered");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to trigger notification", 500);
  }
}

