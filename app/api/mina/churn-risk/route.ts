import { NextRequest } from "next/server";
import { detectChurnRisk } from "@/features/mina/services/minaEngine";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/mina/churn-risk?customerId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    const risk = await detectChurnRisk(customerId);

    return successResponse(risk);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to detect churn risk", 500);
  }
}

