import { NextRequest } from "next/server";
import { getStaffPerformanceAnalysis } from "@/lib/ai/staff";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logAIUsage } from "@/lib/ai/openai";

// GET /api/ai/staff-performance?staffId=xxx&period=MONTHLY
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get("staffId");
    const period = (searchParams.get("period") || "MONTHLY") as
      | "WEEKLY"
      | "MONTHLY"
      | "YEARLY";

    if (!staffId) {
      return errorResponse("Staff ID is required", 400);
    }

    const startTime = Date.now();
    const analysis = await getStaffPerformanceAnalysis(staffId, period);
    const duration = Date.now() - startTime;

    if (!analysis) {
      return errorResponse("Failed to generate analysis", 500);
    }

    // Log AI usage
    await logAIUsage(
      "ANALYSIS",
      { staffId, period },
      { analysis },
      "gpt-4o",
      undefined,
      undefined,
      duration
    );

    return successResponse(analysis);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get staff performance analysis", 500);
  }
}

