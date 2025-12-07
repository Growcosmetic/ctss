import { NextRequest } from "next/server";
import { suggestServices } from "@/features/mina/services/minaEngine";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/mina/suggest-services?customerId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    const suggestions = await suggestServices(customerId);

    return successResponse(suggestions);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get service suggestions", 500);
  }
}

