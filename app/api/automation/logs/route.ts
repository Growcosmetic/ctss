import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { AutomationStatus } from "@prisma/client";

/**
 * Phase 12 - Automation Logs API
 * 
 * GET /api/automation/logs - List automation execution logs
 * 
 * Only OWNER can access
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
    throw new Error("Access denied: Only OWNER can view automation logs");
  }
}

// GET /api/automation/logs - List logs
export async function GET(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);
    await requireOwner(request, salonId);

    const searchParams = request.nextUrl.searchParams;
    const ruleId = searchParams.get("ruleId");
    const status = searchParams.get("status") as AutomationStatus | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {
      salonId,
    };

    if (ruleId) {
      where.ruleId = ruleId;
    }

    if (status) {
      where.status = status;
    }

    const [logs, total] = await Promise.all([
      prisma.automationRuleLog.findMany({
        where,
        orderBy: { executedAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          rule: {
            select: {
              id: true,
              name: true,
              action: true,
            },
          },
        },
      }),
      prisma.automationRuleLog.count({ where }),
    ]);

    return successResponse({
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error("[Automation Logs API] Error:", error);
    return errorResponse(error.message || "Failed to get automation logs", 500);
  }
}

