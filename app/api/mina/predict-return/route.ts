import { NextRequest } from "next/server";
import { predictReturnDate } from "@/features/mina/services/minaEngine";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/mina/predict-return?customerId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    const prediction = await predictReturnDate(customerId);

    return successResponse(prediction);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to predict return date", 500);
  }
}

