import { NextRequest } from "next/server";
import { getUpsellSuggestions } from "@/lib/ai/upsell";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logAIUsage } from "@/lib/ai/openai";

// GET /api/ai/upsell?customerId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    const startTime = Date.now();
    const suggestions = await getUpsellSuggestions(customerId);
    const duration = Date.now() - startTime;

    // Log AI usage
    await logAIUsage(
      "RECOMMENDATION",
      { customerId },
      { suggestions },
      "gpt-4o",
      undefined,
      undefined,
      duration
    );

    return successResponse(suggestions);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get upsell suggestions", 500);
  }
}

