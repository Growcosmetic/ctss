import { NextRequest } from "next/server";
import { getBookingPrediction } from "@/lib/ai/booking";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logAIUsage } from "@/lib/ai/openai";

// GET /api/ai/booking-prediction?customerId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    const startTime = Date.now();
    const prediction = await getBookingPrediction(customerId);
    const duration = Date.now() - startTime;

    if (!prediction) {
      return errorResponse("Failed to generate prediction", 500);
    }

    // Log AI usage
    await logAIUsage(
      "PREDICTION",
      { customerId },
      { prediction },
      "gpt-4o",
      undefined,
      undefined,
      duration
    );

    return successResponse(prediction);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get booking prediction", 500);
  }
}

