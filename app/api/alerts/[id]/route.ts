import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { AlertStatus } from "@prisma/client";

/**
 * Phase 10.2 - Alert Actions API
 * 
 * POST /api/alerts/:id/acknowledge - Acknowledge an alert
 * POST /api/alerts/:id/resolve - Resolve an alert
 * POST /api/alerts/:id/dismiss - Dismiss an alert
 */

async function updateAlertStatus(
  request: NextRequest,
  alertId: string,
  status: AlertStatus,
  action: "acknowledge" | "resolve" | "dismiss"
) {
  try {
    const salonId = await requireSalonId(request);
    const userId = await getCurrentUserId();

    // Verify alert belongs to salon
    const alert = await prisma.systemAlert.findUnique({
      where: { id: alertId },
      select: { salonId: true },
    });

    if (!alert) {
      return errorResponse("Alert not found", 404);
    }

    if (alert.salonId !== salonId) {
      return errorResponse("Access denied", 403);
    }

    // Update alert status
    const updateData: any = {
      status,
    };

    if (action === "acknowledge") {
      updateData.acknowledgedAt = new Date();
      updateData.acknowledgedBy = userId;
    } else if (action === "resolve") {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = userId;
    } else if (action === "dismiss") {
      updateData.dismissedAt = new Date();
      updateData.dismissedBy = userId;
    }

    const updated = await prisma.systemAlert.update({
      where: { id: alertId },
      data: updateData,
    });

    return successResponse(updated, `Alert ${action}d successfully`);
  } catch (error: any) {
    console.error(`[Alerts API] Error ${action}ing alert:`, error);
    return errorResponse(error.message || `Failed to ${action} alert`, 500);
  }
}

// POST /api/alerts/:id/acknowledge
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || "acknowledge";

  if (action === "acknowledge") {
    return updateAlertStatus(request, params.id, AlertStatus.ACKNOWLEDGED, "acknowledge");
  } else if (action === "resolve") {
    return updateAlertStatus(request, params.id, AlertStatus.RESOLVED, "resolve");
  } else if (action === "dismiss") {
    return updateAlertStatus(request, params.id, AlertStatus.DISMISSED, "dismiss");
  }

  return errorResponse("Invalid action", 400);
}

