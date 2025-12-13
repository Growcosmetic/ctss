import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { runAlertRulesForAllSalons } from "@/lib/alerts/rules";
import { AlertType } from "@prisma/client";

/**
 * Phase 10.2 - Cron Job for Alert Rules
 * 
 * GET /api/cron/alerts - Run alert rules for all salons
 * 
 * This endpoint should be called periodically (e.g., every hour)
 * Can be triggered by:
 * - External cron service (cron-job.org, etc.)
 * - Server cron job
 * - Scheduled task
 */

export async function GET(request: NextRequest) {
  try {
    // Safety check: Ensure AlertType enum is available
    if (!AlertType || !AlertType.BOOKING_OVERDUE) {
      console.warn("[Cron] AlertType enum not available, skipping alert rules");
      return successResponse({
        success: false,
        skipped: true,
        message: "AlertType enum not available",
      });
    }

    // Optional: Add authentication/authorization for cron endpoint
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }

    console.log("[Cron] Starting alert rules check...");
    const startTime = Date.now();

    await runAlertRulesForAllSalons();

    const duration = Date.now() - startTime;
    console.log(`[Cron] Alert rules check completed in ${duration}ms`);

    return successResponse({
      success: true,
      message: "Alert rules executed successfully",
      duration,
    });
  } catch (error: any) {
    console.error("[Cron] Error running alert rules:", error);
    return errorResponse(error.message || "Failed to run alert rules", 500);
  }
}

