import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { rollbackAutomation } from "@/lib/automation/executor";

/**
 * Phase 12 - Automation Rollback API
 * 
 * POST /api/automation/logs/:id/rollback - Rollback automation execution
 * 
 * Only OWNER can access
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const salonId = await requireSalonId(request);
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Authentication required", 401);
    }

    // Verify log belongs to salon
    const log = await prisma.automationRuleLog.findUnique({
      where: { id: params.id },
      select: { salonId: true },
    });

    if (!log) {
      return errorResponse("Automation log not found", 404);
    }

    if (log.salonId !== salonId) {
      return errorResponse("Access denied", 403);
    }

    // Verify user is OWNER
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "OWNER") {
      return errorResponse("Access denied: Only OWNER can rollback automation", 403);
    }

    await rollbackAutomation(params.id, userId);

    return successResponse(null, "Automation rolled back successfully");
  } catch (error: any) {
    console.error(`[Automation Rollback API] Error:`, error);
    return errorResponse(error.message || "Failed to rollback automation", 500);
  }
}

