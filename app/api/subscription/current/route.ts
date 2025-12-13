import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId } from "@/lib/api-helpers";
import { getCurrentSubscription } from "@/lib/subscription/guards";
import { getCurrentUsage, syncUsage } from "@/lib/subscription/usage";
import { isSalonActive } from "@/lib/subscription/edge-cases";

// GET /api/subscription/current - Get current subscription info
export async function GET(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);

    // Phase 8.5: Check salon status
    const salonActive = await isSalonActive(salonId);
    if (!salonActive) {
      return errorResponse("Salon không hoạt động. Vui lòng liên hệ hỗ trợ.", 403);
    }

    // Sync usage before returning
    await syncUsage(salonId);

    const subscription = await getCurrentSubscription(salonId);
    const usage = await getCurrentUsage(salonId);

    return successResponse({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        isActive: subscription.isActive,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEndsAt: subscription.currentPeriodEndsAt,
      },
      usage,
      salonActive: true,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get subscription", 500);
  }
}

