import { NextRequest } from "next/server";
import { processReminderJobs } from "@/features/notifications/services/scheduler";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * CRON endpoint for processing reminder jobs
 * This should be called every 5 minutes by a cron service (e.g., Vercel Cron, external cron)
 * 
 * To use with Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/notifications",
 *     "schedule": "every 5 minutes"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication header check
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }

    await processReminderJobs();

    return successResponse(null, "Reminder jobs processed successfully");
  } catch (error: any) {
    console.error("Cron error:", error);
    return errorResponse(error.message || "Failed to process reminder jobs", 500);
  }
}

