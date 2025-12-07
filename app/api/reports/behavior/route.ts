import { NextRequest } from "next/server";
import { getBookingBehavior } from "@/features/reports/services/reportQueries";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/reports/behavior?startDate=...&endDate=...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    if (!startDateStr || !endDateStr) {
      return errorResponse("startDate and endDate are required", 400);
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return errorResponse("Invalid date format", 400);
    }

    const behavior = await getBookingBehavior(startDate, endDate);

    return successResponse(behavior);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch booking behavior", 500);
  }
}

