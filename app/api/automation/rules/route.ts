import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { AutomationTrigger, AutomationAction } from "@prisma/client";

/**
 * Phase 12 - Automation Rules API
 * 
 * GET /api/automation/rules - List automation rules
 * POST /api/automation/rules - Create automation rule
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
    throw new Error("Access denied: Only OWNER can manage automation rules");
  }
}

// GET /api/automation/rules - List rules
export async function GET(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);
    await requireOwner(request, salonId);

    const searchParams = request.nextUrl.searchParams;
    const enabled = searchParams.get("enabled");

    const where: any = {
      salonId,
    };

    if (enabled !== null) {
      where.enabled = enabled === "true";
    }

    const rules = await prisma.automationRule.findMany({
      where,
      orderBy: [
        { enabled: "desc" }, // Enabled first
        { createdAt: "desc" },
      ],
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });

    return successResponse({
      rules: rules.map((rule) => ({
        ...rule,
        logCount: rule._count.logs,
      })),
    });
  } catch (error: any) {
    console.error("[Automation Rules API] Error:", error);
    return errorResponse(error.message || "Failed to get automation rules", 500);
  }
}

// POST /api/automation/rules - Create rule
export async function POST(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);
    await requireOwner(request, salonId);

    const userId = await getCurrentUserId();
    const body = await request.json();
    const { name, description, trigger, action, conditions, config, schedule } = body;

    if (!name || !trigger || !action) {
      return errorResponse("Missing required fields: name, trigger, action", 400);
    }

    if (!Object.values(AutomationTrigger).includes(trigger)) {
      return errorResponse("Invalid trigger", 400);
    }

    if (!Object.values(AutomationAction).includes(action)) {
      return errorResponse("Invalid action", 400);
    }

    const rule = await prisma.automationRule.create({
      data: {
        salonId,
        name,
        description,
        trigger,
        action,
        conditions: conditions || {},
        config: config || {},
        schedule,
        enabled: false, // OFF by default
        createdBy: userId || undefined,
      },
    });

    return successResponse(rule, "Automation rule created successfully", 201);
  } catch (error: any) {
    console.error("[Automation Rules API] Error creating rule:", error);
    return errorResponse(error.message || "Failed to create automation rule", 500);
  }
}

