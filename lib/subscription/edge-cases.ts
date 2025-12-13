/**
 * Phase 8.5 - Edge Case Handling for Subscription System
 */

import { prisma } from "../prisma";
import { SubscriptionStatus } from "@prisma/client";
import { getCurrentSubscription } from "./guards";

/**
 * Check if salon is active
 */
export async function isSalonActive(salonId: string): Promise<boolean> {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { status: true },
  });

  return salon?.status === "ACTIVE";
}

/**
 * Check if subscription is active (not expired, cancelled, or suspended)
 */
export async function isSubscriptionActive(salonId: string): Promise<{
  active: boolean;
  reason?: string;
}> {
  const subscription = await getCurrentSubscription(salonId);

  if (!subscription.isActive) {
    if (subscription.status === SubscriptionStatus.EXPIRED) {
      return {
        active: false,
        reason: "Gói dịch vụ đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.",
      };
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      return {
        active: false,
        reason: "Gói dịch vụ đã bị hủy. Vui lòng kích hoạt lại để tiếp tục sử dụng.",
      };
    }

    if (subscription.status === SubscriptionStatus.SUSPENDED) {
      return {
        active: false,
        reason: "Gói dịch vụ đã bị tạm ngưng. Vui lòng liên hệ hỗ trợ.",
      };
    }

    // Check if trial expired
    if (subscription.trialEndsAt && subscription.trialEndsAt < new Date()) {
      return {
        active: false,
        reason: "Thời gian dùng thử đã hết hạn. Vui lòng nâng cấp để tiếp tục sử dụng.",
      };
    }

    // Check if period ended
    if (
      subscription.currentPeriodEndsAt &&
      subscription.currentPeriodEndsAt < new Date()
    ) {
      return {
        active: false,
        reason: "Gói dịch vụ đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.",
      };
    }

    return {
      active: false,
      reason: "Gói dịch vụ không hoạt động.",
    };
  }

  return { active: true };
}

/**
 * Handle plan downgrade
 * - Check if downgrade would exceed limits
 * - Warn about data loss (if applicable)
 */
export async function canDowngrade(
  salonId: string,
  targetPlanName: string
): Promise<{
  allowed: boolean;
  warnings: string[];
  errors: string[];
}> {
  const subscription = await getCurrentSubscription(salonId);
  const currentPlan = subscription.plan;

  if (!currentPlan) {
    return {
      allowed: false,
      warnings: [],
      errors: ["Không tìm thấy gói hiện tại"],
    };
  }

  const warnings: string[] = [];
  const errors: string[] = [];

  // Get current usage
  const { getCurrentUsage } = await import("./usage");
  const usage = await getCurrentUsage(salonId);

  // Get target plan limits
  const { PLAN_CONFIGS } = await import("./constants");
  const targetPlan = PLAN_CONFIGS[targetPlanName as keyof typeof PLAN_CONFIGS];

  if (!targetPlan) {
    return {
      allowed: false,
      warnings: [],
      errors: [`Gói "${targetPlanName}" không tồn tại`],
    };
  }

  // Check limits
  if (usage.staff > targetPlan.limits.staff && targetPlan.limits.staff < 999999) {
    errors.push(
      `Bạn có ${usage.staff} nhân viên, nhưng gói ${targetPlanName} chỉ cho phép ${targetPlan.limits.staff} nhân viên.`
    );
  }

  if (
    usage.customers > targetPlan.limits.customers &&
    targetPlan.limits.customers < 999999
  ) {
    errors.push(
      `Bạn có ${usage.customers} khách hàng, nhưng gói ${targetPlanName} chỉ cho phép ${targetPlan.limits.customers} khách hàng.`
    );
  }

  // Check features
  const { hasFeature } = await import("./constants");
  const currentFeatures = PLAN_CONFIGS[currentPlan.name as keyof typeof PLAN_CONFIGS]?.features || {};

  for (const [feature, enabled] of Object.entries(currentFeatures)) {
    if (enabled && !hasFeature(targetPlanName as any, feature as any)) {
      warnings.push(
        `Tính năng "${feature}" sẽ bị tắt sau khi hạ cấp xuống gói ${targetPlanName}.`
      );
    }
  }

  return {
    allowed: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Check if user is OWNER
 */
export async function isOwner(userId: string, salonId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, salonId: true },
  });

  return (
    user?.role === "OWNER" &&
    user.salonId === salonId
  );
}

/**
 * Validate subscription before operation
 */
export async function validateSubscriptionForOperation(
  salonId: string
): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Check salon status
  const salonActive = await isSalonActive(salonId);
  if (!salonActive) {
    return {
      valid: false,
      error: "Salon không hoạt động. Vui lòng liên hệ hỗ trợ.",
    };
  }

  // Check subscription status
  const subscriptionCheck = await isSubscriptionActive(salonId);
  if (!subscriptionCheck.active) {
    return {
      valid: false,
      error: subscriptionCheck.reason || "Gói dịch vụ không hoạt động.",
    };
  }

  return { valid: true };
}

