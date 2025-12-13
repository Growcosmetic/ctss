import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, getCurrentUserId } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { PLAN_CONFIGS } from "@/lib/subscription/constants";
import { addMonths } from "date-fns";
import { canDowngrade, isOwner } from "@/lib/subscription/edge-cases";

// POST /api/subscription/upgrade - Upgrade subscription plan
export async function POST(request: NextRequest) {
  try {
    const salonId = await requireSalonId(request);
    const userId = await getCurrentUserId();

    // Phase 8.5: Verify user is OWNER
    if (!userId) {
      return errorResponse("Authentication required", 401);
    }

    const isOwnerUser = await isOwner(userId, salonId);
    if (!isOwnerUser) {
      return errorResponse("Chỉ chủ salon mới có thể quản lý gói dịch vụ", 403);
    }

    const body = await request.json();
    const { planName } = body;

    if (!planName || !Object.values(SubscriptionPlan).includes(planName)) {
      return errorResponse("Tên gói không hợp lệ", 400);
    }

    // Get or create plan
    let plan = await prisma.plan.findUnique({
      where: { name: planName },
    });

    if (!plan) {
      // Create plan from config
      const config = PLAN_CONFIGS[planName as SubscriptionPlan];
      plan = await prisma.plan.create({
        data: {
          name: planName as SubscriptionPlan,
          displayName: config.displayName,
          price: config.price,
          features: config.features,
          limits: config.limits,
          isActive: true,
        },
      });
    }

    // Get current subscription
    const currentSubscription = await prisma.subscription.findUnique({
      where: { salonId },
      include: { plan: true },
    });

    // Phase 8.5: Check if downgrade is allowed
    if (currentSubscription?.plan) {
      const currentPlanName = currentSubscription.plan.name;
      const planOrder = [SubscriptionPlan.FREE, SubscriptionPlan.BASIC, SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE];
      const currentIndex = planOrder.indexOf(currentPlanName);
      const targetIndex = planOrder.indexOf(planName as SubscriptionPlan);

      // If downgrading, check limits
      if (targetIndex < currentIndex) {
        const downgradeCheck = await canDowngrade(salonId, planName);
        if (!downgradeCheck.allowed) {
          return errorResponse(
            `Không thể hạ cấp: ${downgradeCheck.errors.join(", ")}`,
            400
          );
        }

        // Return warnings if any
        if (downgradeCheck.warnings.length > 0) {
          // Log warnings but allow downgrade
          console.warn("Downgrade warnings:", downgradeCheck.warnings);
        }
      }
    }

    const now = new Date();
    const trialEndsAt = addMonths(now, 1); // 1 month trial
    const currentPeriodEndsAt = addMonths(now, 1); // 1 month period

    if (currentSubscription) {
      // Update existing subscription
      const action = planName === SubscriptionPlan.FREE ? "DOWNGRADE" : 
                     (currentSubscription.plan?.name === SubscriptionPlan.FREE ? "UPGRADE" : "UPGRADE");

      // Create history record
      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId: currentSubscription.id,
          action,
          fromPlanId: currentSubscription.planId,
          toPlanId: plan.id,
          reason: `Upgraded to ${planName}`,
        },
      });

      // Update subscription
      const updated = await prisma.subscription.update({
        where: { salonId },
        data: {
          planId: plan.id,
          status: planName === SubscriptionPlan.FREE ? SubscriptionStatus.ACTIVE : SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEndsAt,
          cancelledAt: null,
          cancelReason: null,
        },
        include: { plan: true },
      });

      // Update salon
      await prisma.salon.update({
        where: { id: salonId },
        data: {
          planId: plan.id,
          planStatus: SubscriptionStatus.ACTIVE,
          currentPeriodEndsAt,
        },
      });

      return successResponse(updated, "Subscription upgraded successfully");
    } else {
      // Create new subscription
      const newSubscription = await prisma.subscription.create({
        data: {
          salonId,
          planId: plan.id,
          status: SubscriptionStatus.TRIAL,
          trialEndsAt,
          currentPeriodStart: now,
          currentPeriodEndsAt,
        },
        include: { plan: true },
      });

      // Create history record
      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId: newSubscription.id,
          action: "UPGRADE",
          toPlanId: plan.id,
          reason: `Initial subscription to ${planName}`,
        },
      });

      // Update salon
      await prisma.salon.update({
        where: { id: salonId },
        data: {
          planId: plan.id,
          planStatus: SubscriptionStatus.TRIAL,
          trialEndsAt,
          currentPeriodEndsAt,
        },
      });

      return successResponse(newSubscription, "Subscription created successfully");
    }
  } catch (error: any) {
    return errorResponse(error.message || "Failed to upgrade subscription", 500);
  }
}

