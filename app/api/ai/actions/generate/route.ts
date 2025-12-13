import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { ActionSource } from "@prisma/client";
import { generateActionsFromSummary, generateActionFromAlert } from "@/lib/ai/action-generator";

/**
 * Phase 11.3 - Generate Actions API
 * 
 * POST /api/ai/actions/generate
 * 
 * Generate actions from AI Summary or Alert Explanations
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
    throw new Error("Access denied: Only OWNER or ADMIN can generate actions");
  }
}

export async function POST(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);
    await requireOwnerOrAdmin(request, salonId);

    const body = await request.json();
    const { source, sourceId } = body;

    if (!source || !sourceId) {
      return errorResponse("Missing required fields: source, sourceId", 400);
    }

    let actionsToCreate: Array<{
      salonId: string;
      source: ActionSource;
      sourceId: string;
      priority: any;
      title: string;
      description: string;
      contextLink?: string;
      metadata?: any;
    }> = [];

    if (source === ActionSource.AI_SUMMARY) {
      // Generate from AI Summary
      const summary = await prisma.aISummary.findUnique({
        where: { id: sourceId },
        select: { content: true },
      });

      if (!summary) {
        return errorResponse("AI Summary not found", 404);
      }

      const summaryContent = summary.content as any;
      if (summaryContent.suggestedActions) {
        const generatedActions = generateActionsFromSummary(sourceId, summaryContent);
        actionsToCreate = generatedActions.map((action) => ({
          salonId,
          source: action.source,
          sourceId: action.sourceId || sourceId,
          priority: action.priority,
          title: action.title,
          description: action.description,
          contextLink: action.contextLink,
          metadata: action.metadata,
        }));
      }
    } else if (source === ActionSource.ALERT_EXPLANATION) {
      // Generate from Alert Explanation
      const explanation = await prisma.aIAlertExplanation.findUnique({
        where: { alertId: sourceId },
        include: {
          alert: {
            select: {
              type: true,
              severity: true,
              title: true,
            },
          },
        },
      });

      if (!explanation) {
        return errorResponse("Alert explanation not found", 404);
      }

      const explanationContent = explanation.content as any;
      const generatedAction = generateActionFromAlert(
        sourceId,
        {
          type: explanation.alert.type,
          severity: explanation.alert.severity,
          title: explanation.alert.title,
        },
        {
          suggestedAction: explanationContent.suggestedAction,
          cause: explanationContent.cause,
          risk: explanationContent.risk,
        }
      );

      actionsToCreate = [
        {
          salonId,
          source: generatedAction.source,
          sourceId: generatedAction.sourceId || sourceId,
          priority: generatedAction.priority,
          title: generatedAction.title,
          description: generatedAction.description,
          contextLink: generatedAction.contextLink,
          metadata: generatedAction.metadata,
        },
      ];
    } else {
      return errorResponse("Invalid source. Must be AI_SUMMARY or ALERT_EXPLANATION", 400);
    }

    // Check if actions already exist for this source
    const existingActions = await prisma.aIAction.findMany({
      where: {
        salonId,
        source,
        sourceId,
        status: { in: ["PENDING", "DONE"] }, // Don't recreate if already exists and not ignored
      },
    });

    if (existingActions.length > 0) {
      return successResponse(
        {
          actions: existingActions,
          message: "Actions already exist for this source",
        },
        "Actions already exist",
        200
      );
    }

    // Create actions
    const createdActions = await prisma.aIAction.createMany({
      data: actionsToCreate,
    });

    // Fetch created actions
    const actions = await prisma.aIAction.findMany({
      where: {
        salonId,
        source,
        sourceId,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return successResponse(
      {
        actions,
        created: createdActions.count,
      },
      `Generated ${createdActions.count} action(s)`,
      201
    );
  } catch (error: any) {
    console.error("[AI Actions Generate API] Error:", error);
    return errorResponse(error.message || "Failed to generate actions", 500);
  }
}

