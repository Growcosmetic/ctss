// ============================================
// Follow-up Rules Engine
// ============================================

import type { FollowUpRule } from "./types";

export const followUpRules: FollowUpRule[] = [
  // ============================================
  // POST-SERVICE FOLLOW-UPS (0-24h)
  // ============================================
  {
    id: "after_1_day",
    daysAfter: 1,
    trigger: "POST_SERVICE",
    messageType: "thank_you",
    enabled: true,
    conditions: {
      journeyState: ["POST_SERVICE", "RETENTION"],
    },
  },
  {
    id: "after_3_days",
    daysAfter: 3,
    trigger: "POST_SERVICE",
    messageType: "check_health",
    enabled: true,
    conditions: {
      journeyState: ["POST_SERVICE", "RETENTION"],
    },
  },

  // ============================================
  // RETENTION FOLLOW-UPS (15-90 days)
  // ============================================
  {
    id: "after_15_days",
    daysAfter: 15,
    trigger: "RETENTION",
    messageType: "care_tip",
    enabled: true,
    conditions: {
      journeyState: ["RETENTION"],
      minVisits: 1,
    },
  },
  {
    id: "after_30_days",
    daysAfter: 30,
    trigger: "RETENTION",
    messageType: "light_upsell",
    enabled: true,
    conditions: {
      journeyState: ["RETENTION"],
      minVisits: 1,
    },
  },
  {
    id: "after_45_days",
    daysAfter: 45,
    trigger: "RETENTION",
    messageType: "booking_reminder",
    enabled: true,
    conditions: {
      journeyState: ["RETENTION"],
    },
  },
  {
    id: "after_60_days",
    daysAfter: 60,
    trigger: "RETENTION",
    messageType: "booking_reminder",
    enabled: true,
    conditions: {
      journeyState: ["RETENTION"],
    },
  },
  {
    id: "after_75_days",
    daysAfter: 75,
    trigger: "RETENTION",
    messageType: "churn_prevention",
    enabled: true,
    conditions: {
      journeyState: ["RETENTION"],
    },
  },
  {
    id: "after_90_days",
    daysAfter: 90,
    trigger: "RETENTION",
    messageType: "return_offer",
    enabled: true,
    conditions: {
      journeyState: ["RETENTION", "CONSIDERATION"],
    },
  },
];

// ============================================
// Get Rules for Specific Day
// ============================================

export function getRulesForDay(daysAfter: number): FollowUpRule[] {
  return followUpRules.filter(
    (rule) => rule.enabled !== false && rule.daysAfter === daysAfter
  );
}

// ============================================
// Check if Rule Applies to Customer
// ============================================

export function ruleApplies(
  rule: FollowUpRule,
  customerData: {
    journeyState?: string;
    totalVisits?: number;
  }
): boolean {
  if (!rule.enabled) return false;

  const { conditions } = rule;
  if (!conditions) return true;

  // Check journey state
  if (conditions.journeyState) {
    if (!customerData.journeyState) return false;
    if (!conditions.journeyState.includes(customerData.journeyState)) {
      return false;
    }
  }

  if (conditions.excludeJourneyState) {
    if (customerData.journeyState) {
      if (conditions.excludeJourneyState.includes(customerData.journeyState)) {
        return false;
      }
    }
  }

  // Check minimum visits
  if (conditions.minVisits) {
    const visits = customerData.totalVisits || 0;
    if (visits < conditions.minVisits) return false;
  }

  return true;
}

