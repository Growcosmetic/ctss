import { NextRequest } from "next/server";
import { getInventoryForecast } from "@/lib/ai/inventory";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logAIUsage } from "@/lib/ai/openai";

// GET /api/ai/inventory-forecast?productId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    if (!productId) {
      return errorResponse("Product ID is required", 400);
    }

    const startTime = Date.now();
    const forecast = await getInventoryForecast(productId);
    const duration = Date.now() - startTime;

    if (!forecast) {
      return errorResponse("Failed to generate forecast", 500);
    }

    // Log AI usage
    await logAIUsage(
      "PREDICTION",
      { productId },
      { forecast },
      "gpt-4o",
      undefined,
      undefined,
      duration
    );

    return successResponse(forecast);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get inventory forecast", 500);
  }
}

