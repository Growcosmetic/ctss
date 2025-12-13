import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { ActionStatus } from "@prisma/client";

/**
 * Phase 11.3 - AI Action Actions API
 * 
 * PATCH /api/ai/actions/:id - Update action status
 * DELETE /api/ai/actions/:id - Delete action
 */

async function updateActionStatus(
  request: NextRequest,
  actionId: string,
  status: ActionStatus
) {
  try {
    const salonId = await requireSalonId(request);
    const userId = await getCurrentUserId();

    // Verify action belongs to salon
    const action = await prisma.aIAction.findUnique({
      where: { id: actionId },
      select: { salonId: true },
    });

    if (!action) {
      return errorResponse("Action not found", 404);
    }

    if (action.salonId !== salonId) {
      return errorResponse("Access denied", 403);
    }

    // Update action status
    const updateData: any = {
      status,
    };

    if (status === ActionStatus.DONE) {
      updateData.completedAt = new Date();
      updateData.completedBy = userId;
      updateData.ignoredAt = null;
      updateData.ignoredBy = null;
    } else if (status === ActionStatus.IGNORED) {
      updateData.ignoredAt = new Date();
      updateData.ignoredBy = userId;
      updateData.completedAt = null;
      updateData.completedBy = null;
    } else if (status === ActionStatus.PENDING) {
      updateData.completedAt = null;
      updateData.completedBy = null;
      updateData.ignoredAt = null;
      updateData.ignoredBy = null;
    }

    const updated = await prisma.aIAction.update({
      where: { id: actionId },
      data: updateData,
    });

    return successResponse(updated, `Action ${status.toLowerCase()} successfully`);
  } catch (error: any) {
    console.error(`[AI Actions API] Error updating action:`, error);
    return errorResponse(error.message || `Failed to update action`, 500);
  }
}

// PATCH /api/ai/actions/:id - Update action
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !Object.values(ActionStatus).includes(status)) {
      return errorResponse("Invalid status", 400);
    }

    return updateActionStatus(request, params.id, status);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update action", 500);
  }
}

// DELETE /api/ai/actions/:id - Delete action
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const salonId = await requireSalonId(request);

    // Verify action belongs to salon
    const action = await prisma.aIAction.findUnique({
      where: { id: params.id },
      select: { salonId: true },
    });

    if (!action) {
      return errorResponse("Action not found", 404);
    }

    if (action.salonId !== salonId) {
      return errorResponse("Access denied", 403);
    }

    await prisma.aIAction.delete({
      where: { id: params.id },
    });

    return successResponse(null, "Action deleted successfully");
  } catch (error: any) {
    console.error(`[AI Actions API] Error deleting action:`, error);
    return errorResponse(error.message || "Failed to delete action", 500);
  }
}

