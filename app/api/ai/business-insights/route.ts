import { NextRequest } from "next/server";
import { getBusinessInsights } from "@/lib/ai/business";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logAIUsage } from "@/lib/ai/openai";

// GET /api/ai/business-insights
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const insights = await getBusinessInsights();
    const duration = Date.now() - startTime;

    // Log AI usage to database
    try {
      await prisma.aiLog.create({
        data: {
          type: "ANALYSIS",
          input: {},
          output: insights,
          model: "gpt-4o",
          duration,
          status: "SUCCESS",
        },
      });
    } catch (logError) {
      console.error("Failed to log AI usage:", logError);
    }

    return successResponse(insights);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get business insights", 500);
  }
}

