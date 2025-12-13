import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

/**
 * Phase 12 - Automation Rule Actions API
 * 
 * PATCH /api/automation/rules/:id - Update rule (enable/disable)
 * DELETE /api/automation/rules/:id - Delete rule
 */

// Helper: Check if user is OWNER
async function requireOwner(request: NextRequest, salonId: string): Promise<void> {
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

  if (user.role !== "OWNER") {
    throw new Error("Access denied: Only OWNER can manage automation rules");
  }
}

// PATCH /api/automation/rules/:id - Update rule
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const salonId = await requireSalonId(request);
    await requireOwner(request, salonId);

    const userId = await getCurrentUserId();
    const body = await request.json();
    const { enabled, name, description, conditions, config, schedule } = body;

    // Verify rule belongs to salon
    const rule = await prisma.automationRule.findUnique({
      where: { id: params.id },
      select: { salonId: true, enabled: true },
    });

    if (!rule) {
      return errorResponse("Rule not found", 404);
    }

    if (rule.salonId !== salonId) {
      return errorResponse("Access denied", 403);
    }

    const updateData: any = {};

    if (enabled !== undefined) {
      updateData.enabled = enabled;
      if (enabled && !rule.enabled) {
        // Enabling rule
        updateData.enabledBy = userId;
        updateData.enabledAt = new Date();
      } else if (!enabled && rule.enabled) {
        // Disabling rule
        updateData.enabledBy = null;
        updateData.enabledAt = null;
      }
    }

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (config !== undefined) updateData.config = config;
    if (schedule !== undefined) updateData.schedule = schedule;

    const updated = await prisma.automationRule.update({
      where: { id: params.id },
      data: updateData,
    });

    return successResponse(updated, "Rule updated successfully");
  } catch (error: any) {
    console.error(`[Automation Rules API] Error updating rule:`, error);
    return errorResponse(error.message || "Failed to update rule", 500);
  }
}

// DELETE /api/automation/rules/:id - Delete rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const salonId = await requireSalonId(request);
    await requireOwner(request, salonId);

    // Verify rule belongs to salon
    const rule = await prisma.automationRule.findUnique({
      where: { id: params.id },
      select: { salonId: true },
    });

    if (!rule) {
      return errorResponse("Rule not found", 404);
    }

    if (rule.salonId !== salonId) {
      return errorResponse("Access denied", 403);
    }

    await prisma.automationRule.delete({
      where: { id: params.id },
    });

    return successResponse(null, "Rule deleted successfully");
  } catch (error: any) {
    console.error(`[Automation Rules API] Error deleting rule:`, error);
    return errorResponse(error.message || "Failed to delete rule", 500);
  }
}

