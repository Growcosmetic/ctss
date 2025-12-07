import { NextRequest } from "next/server";
import { generateCustomerSummary } from "@/features/mina/services/minaEngine";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/mina/summary?customerId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    const summary = await generateCustomerSummary(customerId);

    return successResponse(summary);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to generate customer summary", 500);
  }
}

