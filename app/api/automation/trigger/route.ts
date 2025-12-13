import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId } from "@/lib/api-helpers";
import { checkAndExecuteAutomations } from "@/lib/automation/executor";
import { AutomationTrigger } from "@prisma/client";

/**
 * Phase 12 - Automation Trigger API
 * 
 * POST /api/automation/trigger - Trigger automation execution
 * 
 * Called internally when AIAction with HIGH/CRITICAL priority is created
 */

export async function POST(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);
    const body = await request.json();
    const { trigger, triggerId, triggerType, data } = body;

    if (!trigger || !triggerId || !triggerType) {
      return errorResponse("Missing required fields: trigger, triggerId, triggerType", 400);
    }

    if (!Object.values(AutomationTrigger).includes(trigger)) {
      return errorResponse("Invalid trigger", 400);
    }

    await checkAndExecuteAutomations(salonId, trigger, {
      triggerId,
      triggerType,
      data: data || {},
    });

    return successResponse(null, "Automation triggered successfully");
  } catch (error: any) {
    console.error("[Automation Trigger API] Error:", error);
    return errorResponse(error.message || "Failed to trigger automation", 500);
  }
}
