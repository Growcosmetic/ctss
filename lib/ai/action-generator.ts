/**
 * Phase 11.3 - AI Action Generator
 * 
 * Generates structured actions from AI Summary and Alert Explanations
 * No AI chat, only structured suggestions
 */

import { ActionPriority, ActionSource } from "@prisma/client";

export interface ActionInput {
  source: ActionSource;
  sourceId?: string;
  priority: ActionPriority;
  title: string;
  description: string;
  contextLink?: string;
  metadata?: Record<string, any>;
}

/**
 * Generate actions from AI Summary suggested actions
 */
export function generateActionsFromSummary(
  summaryId: string,
  summaryData: {
    suggestedActions: Array<{
      priority: "LOW" | "MEDIUM" | "HIGH";
      action: string;
      reason: string;
    }>;
  }
): ActionInput[] {
  return summaryData.suggestedActions.map((suggested) => ({
    source: ActionSource.AI_SUMMARY,
    sourceId: summaryId,
    priority: mapPriority(suggested.priority),
    title: suggested.action,
    description: suggested.reason,
    contextLink: "/dashboard/insights",
    metadata: {
      fromSummary: true,
      originalPriority: suggested.priority,
    },
  }));
}

/**
 * Generate action from Alert Explanation
 */
export function generateActionFromAlert(
  alertId: string,
  alertData: {
    type: string;
    severity: string;
    title: string;
  },
  explanation: {
    suggestedAction: string;
    cause?: string;
    risk?: string;
  }
): ActionInput {
  return {
    source: ActionSource.ALERT_EXPLANATION,
    sourceId: alertId,
    priority: mapSeverityToPriority(alertData.severity),
    title: `Xử lý cảnh báo: ${alertData.title}`,
    description: explanation.suggestedAction,
    contextLink: `/dashboard/insights?alertId=${alertId}`,
    metadata: {
      alertType: alertData.type,
      alertSeverity: alertData.severity,
      cause: explanation.cause,
      risk: explanation.risk,
    },
  };
}

/**
 * Map priority string to ActionPriority enum
 */
function mapPriority(priority: "LOW" | "MEDIUM" | "HIGH"): ActionPriority {
  switch (priority) {
    case "HIGH":
      return ActionPriority.HIGH;
    case "MEDIUM":
      return ActionPriority.MEDIUM;
    case "LOW":
      return ActionPriority.LOW;
    default:
      return ActionPriority.MEDIUM;
  }
}

/**
 * Map alert severity to action priority
 */
function mapSeverityToPriority(severity: string): ActionPriority {
  switch (severity) {
    case "CRITICAL":
      return ActionPriority.CRITICAL;
    case "HIGH":
      return ActionPriority.HIGH;
    case "MEDIUM":
      return ActionPriority.MEDIUM;
    case "LOW":
      return ActionPriority.LOW;
    default:
      return ActionPriority.MEDIUM;
  }
}

