import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { SummaryPeriod } from "@prisma/client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { generateAISummary, buildSummaryPrompt, InsightsData, AlertsData } from "@/lib/ai/summary-prompt";

/**
 * Phase 11.1 - AI Operational Summary API
 * 
 * GET /api/ai/summary?period=day|week|month
 * 
 * Generates AI summary based on Operation Insights + System Alerts
 * Only OWNER/ADMIN can access
 */

// Helper: Check if user is OWNER or ADMIN
async function requireOwnerOrAdmin(request: NextRequest, salonId: string): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, salonId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.salonId !== salonId) {
    throw new Error("Access denied: User does not belong to this salon");
  }

  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    throw new Error("Access denied: Only OWNER or ADMIN can access AI summary");
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const salonId = await requireSalonId(request);

    // Phase 11.1: Require OWNER or ADMIN
    await requireOwnerOrAdmin(request, salonId);

    const searchParams = request.nextUrl.searchParams;
    const periodParam = searchParams.get("period") || "day";
    const period = periodParam === "week" ? "week" : periodParam === "month" ? "month" : "day";

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let periodDate: Date;
    let periodEnum: SummaryPeriod;

    switch (period) {
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        periodDate = startDate;
        periodEnum = SummaryPeriod.WEEK;
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        periodDate = startDate;
        periodEnum = SummaryPeriod.MONTH;
        break;
      case "day":
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        periodDate = startDate;
        periodEnum = SummaryPeriod.DAY;
        break;
    }

    console.log(`[AI Summary] Generating summary for salon ${salonId}, period: ${period}, date: ${format(periodDate, "yyyy-MM-dd")}`);

    // Check if summary already exists
    const existingSummary = await prisma.aISummary.findUnique({
      where: {
        salonId_period_periodDate: {
          salonId,
          period: periodEnum,
          periodDate,
        },
      },
    });

    // If exists and created today, return cached
    if (existingSummary) {
      const today = startOfDay(new Date());
      const summaryDate = startOfDay(existingSummary.createdAt);
      if (summaryDate.getTime() === today.getTime()) {
        console.log(`[AI Summary] Returning cached summary`);
        return successResponse({
          summary: existingSummary.content as any,
          period: {
            type: period,
            date: format(periodDate, "yyyy-MM-dd"),
          },
          cached: true,
          generatedAt: existingSummary.createdAt.toISOString(),
        });
      }
    }

    // Fetch insights data
    const insightsResponse = await fetch(
      `${request.nextUrl.origin}/api/insights/overview?period=${period}&startDate=${format(startDate, "yyyy-MM-dd")}&endDate=${format(endDate, "yyyy-MM-dd")}`,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
          "x-salon-id": salonId,
        },
      }
    );

    if (!insightsResponse.ok) {
      throw new Error("Failed to fetch insights data");
    }

    const insightsResult = await insightsResponse.json();
    if (!insightsResult.success) {
      throw new Error(insightsResult.error || "Failed to get insights");
    }

    const insights: InsightsData = insightsResult.data;

    // Fetch alerts data
    const alertsResponse = await fetch(
      `${request.nextUrl.origin}/api/alerts?unreadOnly=true&limit=20`,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
          "x-salon-id": salonId,
        },
      }
    );

    let alerts: AlertsData = {
      alerts: [],
      counts: { active: 0, critical: 0, high: 0 },
    };

    if (alertsResponse.ok) {
      const alertsResult = await alertsResponse.json();
      if (alertsResult.success) {
        alerts = alertsResult.data;
      }
    }

    // Generate AI summary
    const summaryResult = await generateAISummary(insights, alerts, period);

    // Build prompt (for logging/debugging)
    const prompt = buildSummaryPrompt(insights, alerts, period);

    // Save to database
    const savedSummary = await prisma.aISummary.upsert({
      where: {
        salonId_period_periodDate: {
          salonId,
          period: periodEnum,
          periodDate,
        },
      },
      update: {
        content: summaryResult,
        insightsData: insights,
        alertsData: alerts,
      },
      create: {
        salonId,
        period: periodEnum,
        periodDate,
        content: summaryResult,
        insightsData: insights,
        alertsData: alerts,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[AI Summary] Generated in ${duration}ms`);

    return successResponse({
      summary: summaryResult,
      period: {
        type: period,
        date: format(periodDate, "yyyy-MM-dd"),
      },
      cached: false,
      generatedAt: savedSummary.createdAt.toISOString(),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[AI Summary] Error after ${duration}ms:`, error);

    if (error.message?.includes("Access denied") || error.message?.includes("Authentication required")) {
      return errorResponse(error.message, 403);
    }

    if (error.message?.includes("Salon ID is required")) {
      return errorResponse(error.message, 401);
    }

    return errorResponse(error.message || "Failed to generate AI summary", 500);
  }
}

