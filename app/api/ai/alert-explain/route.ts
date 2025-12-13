import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { generateAlertExplanation, buildAlertExplainPrompt, AlertData, RelatedData } from "@/lib/ai/alert-explain-prompt";

/**
 * Phase 11.2 - AI Alert Explanation API
 * 
 * GET /api/ai/alert-explain?alertId=xxx
 * 
 * Generates AI explanation for an alert
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
    throw new Error("Access denied: Only OWNER or ADMIN can access AI alert explanation");
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const salonId = await requireSalonId(request);

    // Phase 11.2: Require OWNER or ADMIN
    await requireOwnerOrAdmin(request, salonId);

    const searchParams = request.nextUrl.searchParams;
    const alertId = searchParams.get("alertId");

    if (!alertId) {
      return errorResponse("alertId is required", 400);
    }

    console.log(`[AI Alert Explain] Generating explanation for alert ${alertId}`);

    // Fetch alert
    const alert = await prisma.systemAlert.findUnique({
      where: { id: alertId },
      select: {
        id: true,
        salonId: true,
        type: true,
        severity: true,
        title: true,
        message: true,
        metadata: true,
        createdAt: true,
      },
    });

    if (!alert) {
      return errorResponse("Alert not found", 404);
    }

    // Verify salon ownership
    if (alert.salonId !== salonId) {
      return errorResponse("Access denied", 403);
    }

    // Check if explanation already exists
    const existingExplanation = await prisma.aIAlertExplanation.findUnique({
      where: { alertId },
    });

    // If exists and created today, return cached
    if (existingExplanation) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const explanationDate = new Date(existingExplanation.createdAt);
      explanationDate.setHours(0, 0, 0, 0);

      if (explanationDate.getTime() === today.getTime()) {
        console.log(`[AI Alert Explain] Returning cached explanation`);
        return successResponse({
          explanation: existingExplanation.content as any,
          cached: true,
          generatedAt: existingExplanation.createdAt.toISOString(),
        });
      }
    }

    // Fetch related operational data based on alert type
    const relatedData: RelatedData = {};

    try {
      // Fetch basic insights for context
      const insightsResponse = await fetch(
        `${request.nextUrl.origin}/api/insights/overview?period=day`,
        {
          headers: {
            Cookie: request.headers.get("cookie") || "",
            "x-salon-id": salonId,
          },
        }
      );

      if (insightsResponse.ok) {
        const insightsResult = await insightsResponse.json();
        if (insightsResult.success) {
          const insights = insightsResult.data;
          relatedData.bookings = {
            total: insights.bookings?.total || 0,
            completed: insights.bookings?.completed || 0,
            cancelled: insights.bookings?.cancelled || 0,
            noShow: insights.bookings?.noShow || 0,
          };
          relatedData.revenue = {
            total: insights.revenue?.total || 0,
            transactions: insights.revenue?.transactions || 0,
            averageOrderValue: insights.revenue?.averageOrderValue || 0,
          };
          relatedData.customers = {
            total: insights.customers?.total || 0,
            new: insights.customers?.new || 0,
          };
          relatedData.staff = {
            total: insights.staff?.total || 0,
            active: insights.staff?.active || 0,
          };
        }
      }
    } catch (error) {
      console.warn("[AI Alert Explain] Failed to fetch insights:", error);
    }

    // Fetch type-specific data
    if (alert.type === "LOW_STOCK" && alert.metadata) {
      const productIds = (alert.metadata as any).products?.map((p: any) => p.id) || [];
      if (productIds.length > 0) {
        const products = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            salonId,
          },
          select: {
            id: true,
            name: true,
            stock: true,
            minStock: true,
          },
        });
        relatedData.products = products;
      }
    }

    if (alert.type === "SUBSCRIPTION_EXPIRING") {
      const subscription = await prisma.subscription.findUnique({
        where: { salonId },
        include: { plan: true },
      }).catch(() => null);

      if (subscription) {
        const expiresAt = subscription.currentPeriodEndsAt || subscription.trialEndsAt;
        const daysUntilExpiry = expiresAt
          ? Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : undefined;

        relatedData.subscriptions = {
          planName: subscription.plan?.displayName || "Unknown",
          status: subscription.status,
          expiresAt: expiresAt?.toISOString(),
          daysUntilExpiry,
        };
      }
    }

    // Generate AI explanation
    const alertData: AlertData = {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      metadata: alert.metadata as Record<string, any>,
      createdAt: alert.createdAt.toISOString(),
    };

    const explanationResult = await generateAlertExplanation(alertData, relatedData);

    // Build prompt (for logging/debugging)
    const prompt = buildAlertExplainPrompt(alertData, relatedData);

    // Save to database
    const savedExplanation = await prisma.aIAlertExplanation.upsert({
      where: { alertId },
      update: {
        content: explanationResult,
        relatedData: relatedData,
      },
      create: {
        alertId: alert.id,
        salonId,
        content: explanationResult,
        relatedData: relatedData,
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[AI Alert Explain] Generated in ${duration}ms`);

    return successResponse({
      explanation: explanationResult,
      cached: false,
      generatedAt: savedExplanation.createdAt.toISOString(),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[AI Alert Explain] Error after ${duration}ms:`, error);

    if (error.message?.includes("Access denied") || error.message?.includes("Authentication required")) {
      return errorResponse(error.message, 403);
    }

    if (error.message?.includes("Salon ID is required")) {
      return errorResponse(error.message, 401);
    }

    return errorResponse(error.message || "Failed to generate alert explanation", 500);
  }
}

