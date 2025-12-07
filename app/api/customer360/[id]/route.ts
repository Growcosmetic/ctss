// ============================================
// Customer360 API Route
// ============================================

import { NextRequest } from "next/server";
import { getCustomer360API } from "@/features/customer360/services/customer360Api";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/customer360/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    const data = await getCustomer360API(customerId);

    return successResponse(data, "Customer 360 data retrieved successfully");
  } catch (error: any) {
    console.error("Error fetching Customer 360:", error);
    return errorResponse(
      error.message || "Failed to fetch Customer 360 data",
      500
    );
  }
}

