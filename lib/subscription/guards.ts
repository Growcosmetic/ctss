/**
 * Phase 8 - SaaS Feature & Limit Guards
 */

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "../api-response";
import { requireSalonId } from "../api-helpers";
import { prisma } from "../prisma";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { FeatureFlag, LimitType, hasFeature, getLimit } from "./constants";
import { format } from "date-fns";
import { validateSubscriptionForOperation, isSalonActive } from "./edge-cases";

/**
 * Get current subscription for a salon
 */
export async function getCurrentSubscription(salonId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { salonId },
    include: {
      plan: true,
    },
  });

  if (!subscription) {
    // Return default FREE plan
    const freePlan = await prisma.plan.findUnique({
      where: { name: SubscriptionPlan.FREE },
    });

    return {
      plan: freePlan || { name: SubscriptionPlan.FREE },
      status: SubscriptionStatus.TRIAL,
      isActive: false,
    };
  }

  // Check if subscription is active
  const now = new Date();
  const isActive =
    subscription.status === SubscriptionStatus.ACTIVE &&
    (!subscription.currentPeriodEndsAt || subscription.currentPeriodEndsAt > now);

  return {
    ...subscription,
    plan: subscription.plan,
    isActive,
  };
}

/**
 * Require a specific feature for the current salon
 * Throws error if feature is not available
 */
export async function requireFeature(
  request: NextRequest,
  feature: FeatureFlag
): Promise<void> {
  const salonId = await requireSalonId(request);

  // Phase 8.5: Validate subscription first
  const validation = await validateSubscriptionForOperation(salonId);
  if (!validation.valid) {
    throw new Error(validation.error || "Subscription is not active");
  }

  const subscription = await getCurrentSubscription(salonId);

  if (!subscription.isActive) {
    throw new Error(`Gói dịch vụ không hoạt động. Vui lòng gia hạn để tiếp tục sử dụng.`);
  }

  const planName = subscription.plan?.name || SubscriptionPlan.FREE;
  if (!hasFeature(planName, feature)) {
    throw new Error(`Tính năng "${feature}" không có sẵn trong gói hiện tại của bạn. Vui lòng nâng cấp để sử dụng tính năng này.`);
  }
}

/**
 * Check if a limit is exceeded
 */
export async function checkLimit(
  salonId: string,
  limitType: LimitType,
  currentCount?: number
): Promise<{ exceeded: boolean; limit: number; current: number }> {
  const subscription = await getCurrentSubscription(salonId);
  const planName = subscription.plan?.name || SubscriptionPlan.FREE;
  const limit = getLimit(planName, limitType);

  // If limit is "unlimited" (999999), always allow
  if (limit >= 999999) {
    return { exceeded: false, limit, current: currentCount || 0 };
  }

  // Get current usage for this month
  if (currentCount === undefined) {
    const period = format(new Date(), "yyyyMM");
    const usage = await prisma.usageTracking.findUnique({
      where: {
        salonId_period_metric: {
          salonId,
          period,
          metric: limitType === "bookings" ? "bookings" : limitType === "invoices" ? "invoices" : limitType,
        },
      },
    });

    currentCount = usage?.count || 0;
  }

  return {
    exceeded: currentCount >= limit,
    limit,
    current: currentCount,
  };
}

/**
 * Require a limit not to be exceeded
 * Throws error if limit is exceeded
 */
export async function requireLimit(
  request: NextRequest,
  limitType: LimitType,
  currentCount?: number
): Promise<void> {
  const salonId = await requireSalonId(request);

  // Phase 8.5: Validate subscription first
  const validation = await validateSubscriptionForOperation(salonId);
  if (!validation.valid) {
    throw new Error(validation.error || "Subscription is not active");
  }

  const limitCheck = await checkLimit(salonId, limitType, currentCount);

  if (limitCheck.exceeded) {
    const limitName = {
      staff: "nhân viên",
      bookings: "lịch hẹn",
      customers: "khách hàng",
      invoices: "hóa đơn",
      storage: "dung lượng lưu trữ",
    }[limitType] || limitType;

    throw new Error(
      `Bạn đã đạt giới hạn ${limitName} (${limitCheck.current}/${limitCheck.limit >= 999999 ? "Không giới hạn" : limitCheck.limit}). Vui lòng nâng cấp gói dịch vụ để tiếp tục sử dụng.`
    );
  }
}

/**
 * Track usage for a metric
 */
export async function trackUsage(
  salonId: string,
  metric: string,
  increment: number = 1
): Promise<void> {
  const period = format(new Date(), "yyyyMM");

  await prisma.usageTracking.upsert({
    where: {
      salonId_period_metric: {
        salonId,
        period,
        metric,
      },
    },
    update: {
      count: {
        increment,
      },
    },
    create: {
      salonId,
      period,
      metric,
      count: increment,
    },
  });
}

/**
 * Wrapper for API handlers that require a feature
 */
export function withFeatureGuard<T = any>(
  feature: FeatureFlag,
  handler: (request: NextRequest, salonId: string, ...args: any[]) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    try {
      await requireFeature(request, feature);
      const salonId = await requireSalonId(request);
      return await handler(request, salonId, ...args);
    } catch (error: any) {
      if (error.message?.includes("Feature") || error.message?.includes("Subscription")) {
        return errorResponse(error.message, 403) as NextResponse<T>;
      }
      return errorResponse(error.message || "Feature not available", 403) as NextResponse<T>;
    }
  };
}

/**
 * Wrapper for API handlers that require a limit check
 */
export function withLimitGuard<T = any>(
  limitType: LimitType,
  handler: (request: NextRequest, salonId: string, ...args: any[]) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    try {
      await requireLimit(request, limitType);
      const salonId = await requireSalonId(request);
      return await handler(request, salonId, ...args);
    } catch (error: any) {
      if (error.message?.includes("Limit exceeded")) {
        return errorResponse(error.message, 403) as NextResponse<T>;
      }
      return errorResponse(error.message || "Limit exceeded", 403) as NextResponse<T>;
    }
  };
}

