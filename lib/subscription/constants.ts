/**
 * Phase 8 - SaaS Subscription Constants
 */

import { SubscriptionPlan } from "@prisma/client";

/**
 * Feature flags available in the system
 */
export type FeatureFlag =
  | "POS"
  | "AI"
  | "REPORTS"
  | "MARKETING"
  | "ANALYTICS"
  | "INVENTORY"
  | "TRAINING"
  | "CRM_AUTOMATION"
  | "MULTI_BRANCH"
  | "API_ACCESS";

/**
 * Limit types
 */
export type LimitType = "staff" | "bookings" | "customers" | "invoices" | "storage";

/**
 * Default plan configurations
 */
export const PLAN_CONFIGS: Record<
  SubscriptionPlan,
  {
    displayName: string;
    price: number;
    features: Record<FeatureFlag, boolean>;
    limits: Record<LimitType, number>;
    trialDays: number;
  }
> = {
  FREE: {
    displayName: "Miễn phí",
    price: 0,
    features: {
      POS: false,
      AI: false,
      REPORTS: false,
      MARKETING: false,
      ANALYTICS: false,
      INVENTORY: true,
      TRAINING: false,
      CRM_AUTOMATION: false,
      MULTI_BRANCH: false,
      API_ACCESS: false,
    },
    limits: {
      staff: 3,
      bookings: 100, // per month
      customers: 500,
      invoices: 100, // per month
      storage: 1, // GB
    },
    trialDays: 14,
  },
  BASIC: {
    displayName: "Cơ bản",
    price: 500000, // 500k VND/month
    features: {
      POS: true,
      AI: false,
      REPORTS: true,
      MARKETING: false,
      ANALYTICS: false,
      INVENTORY: true,
      TRAINING: false,
      CRM_AUTOMATION: false,
      MULTI_BRANCH: false,
      API_ACCESS: false,
    },
    limits: {
      staff: 10,
      bookings: 1000, // per month
      customers: 2000,
      invoices: 1000, // per month
      storage: 5, // GB
    },
    trialDays: 14,
  },
  PRO: {
    displayName: "Chuyên nghiệp",
    price: 1500000, // 1.5M VND/month
    features: {
      POS: true,
      AI: true,
      REPORTS: true,
      MARKETING: true,
      ANALYTICS: true,
      INVENTORY: true,
      TRAINING: true,
      CRM_AUTOMATION: true,
      MULTI_BRANCH: false,
      API_ACCESS: false,
    },
    limits: {
      staff: 50,
      bookings: 10000, // per month
      customers: 10000,
      invoices: 10000, // per month
      storage: 50, // GB
    },
    trialDays: 14,
  },
  ENTERPRISE: {
    displayName: "Doanh nghiệp",
    price: 5000000, // 5M VND/month
    features: {
      POS: true,
      AI: true,
      REPORTS: true,
      MARKETING: true,
      ANALYTICS: true,
      INVENTORY: true,
      TRAINING: true,
      CRM_AUTOMATION: true,
      MULTI_BRANCH: true,
      API_ACCESS: true,
    },
    limits: {
      staff: 999999, // Unlimited
      bookings: 999999, // Unlimited
      customers: 999999, // Unlimited
      invoices: 999999, // Unlimited
      storage: 500, // GB
    },
    trialDays: 30,
  },
};

/**
 * Get plan config by name
 */
export function getPlanConfig(plan: SubscriptionPlan) {
  return PLAN_CONFIGS[plan];
}

/**
 * Check if a feature is enabled for a plan
 */
export function hasFeature(plan: SubscriptionPlan, feature: FeatureFlag): boolean {
  return PLAN_CONFIGS[plan]?.features[feature] ?? false;
}

/**
 * Get limit for a plan
 */
export function getLimit(plan: SubscriptionPlan, limitType: LimitType): number {
  return PLAN_CONFIGS[plan]?.limits[limitType] ?? 0;
}

