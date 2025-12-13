import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { ActionStatus, ActionPriority, ActionSource } from "@prisma/client";

/**
 * Phase 11.3 - AI Actions API
 * 
 * GET /api/ai/actions - List actions
 * POST /api/ai/actions - Create action
 * 
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
    throw new Error("Access denied: Only OWNER or ADMIN can access AI actions");
  }
}

// GET /api/ai/actions - List actions
export async function GET(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);
    await requireOwnerOrAdmin(request, salonId);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as ActionStatus | null;
    const priority = searchParams.get("priority") as ActionPriority | null;
    const source = searchParams.get("source") as ActionSource | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {
      salonId,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (source) {
      where.source = source;
    }

    const [actions, total] = await Promise.all([
      prisma.aIAction.findMany({
        where,
        orderBy: [
          { priority: "desc" }, // CRITICAL first
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.aIAction.count({ where }),
    ]);

    // Count by status
    const counts = await Promise.all([
      prisma.aIAction.count({
        where: { salonId, status: ActionStatus.PENDING },
      }),
      prisma.aIAction.count({
        where: { salonId, status: ActionStatus.DONE },
      }),
      prisma.aIAction.count({
        where: { salonId, status: ActionStatus.IGNORED },
      }),
      prisma.aIAction.count({
        where: { salonId, priority: ActionPriority.CRITICAL, status: ActionStatus.PENDING },
      }),
    ]);

    return successResponse({
      actions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      counts: {
        pending: counts[0],
        done: counts[1],
        ignored: counts[2],
        criticalPending: counts[3],
      },
    });
  } catch (error: any) {
    console.error("[AI Actions API] Error:", error);
    return errorResponse(error.message || "Failed to get actions", 500);
  }
}

// POST /api/ai/actions - Create action
export async function POST(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);
    await requireOwnerOrAdmin(request, salonId);

    const body = await request.json();
    const { source, sourceId, priority, title, description, contextLink, metadata } = body;

    if (!title || !description || !priority || !source) {
      return errorResponse("Missing required fields: title, description, priority, source", 400);
    }

    const action = await prisma.aIAction.create({
      data: {
        salonId,
        source,
        sourceId,
        priority,
        title,
        description,
        contextLink,
        metadata: metadata || {},
        status: ActionStatus.PENDING,
      },
    });

    // Phase 12: Trigger automation if priority is HIGH or CRITICAL
    if (priority === ActionPriority.HIGH || priority === ActionPriority.CRITICAL) {
      try {
        const trigger = priority === ActionPriority.CRITICAL
          ? "ACTION_CRITICAL_PRIORITY"
          : "ACTION_HIGH_PRIORITY";

        await fetch(`${request.nextUrl.origin}/api/automation/trigger`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: request.headers.get("cookie") || "",
            "x-salon-id": salonId,
          },
          body: JSON.stringify({
            trigger,
            triggerId: action.id,
            triggerType: "ACTION",
            data: {
              actionId: action.id,
              priority: action.priority,
              source: action.source,
            },
          }),
        }).catch((err) => {
          console.warn("[Automation] Failed to trigger automation:", err);
        });
      } catch (error) {
        console.warn("[Automation] Error triggering automation:", error);
        // Don't fail action creation if automation fails
      }
    }

    return successResponse(action, "Action created successfully", 201);
  } catch (error: any) {
    console.error("[AI Actions API] Error creating action:", error);
    return errorResponse(error.message || "Failed to create action", 500);
  }
}

