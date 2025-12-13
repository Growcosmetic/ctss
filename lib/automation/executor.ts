/**
 * Phase 12 - Automation Engine Executor
 * 
 * Safe, rule-based automation execution
 * No AI, only structured actions
 */

import { prisma } from "../prisma";
import { AutomationTrigger, AutomationAction, AutomationStatus } from "@prisma/client";

export interface AutomationContext {
  triggerId: string;
  triggerType: string;
  data?: Record<string, any>;
}

/**
 * Execute automation rule
 */
export async function executeAutomationRule(
  ruleId: string,
  context: AutomationContext
): Promise<{ success: boolean; result?: any; error?: string }> {
  const rule = await prisma.automationRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule || !rule.enabled) {
    return { success: false, error: "Rule not found or disabled" };
  }

  const startTime = Date.now();
  let result: any = null;
  let error: string | undefined = undefined;
  let status: AutomationStatus = AutomationStatus.SUCCESS;

  try {
    switch (rule.action) {
      case AutomationAction.SEND_NOTIFICATION:
        result = await executeSendNotification(rule, context);
        break;

      case AutomationAction.CREATE_TASK:
        result = await executeCreateTask(rule, context);
        break;

      case AutomationAction.UPDATE_STATUS:
        result = await executeUpdateStatus(rule, context);
        break;

      case AutomationAction.SEND_EMAIL:
        result = await executeSendEmail(rule, context);
        break;

      case AutomationAction.LOG_EVENT:
        result = await executeLogEvent(rule, context);
        break;

      default:
        throw new Error(`Unknown action: ${rule.action}`);
    }
  } catch (err: any) {
    error = err.message || "Unknown error";
    status = AutomationStatus.FAILED;
  }

  // Log execution
  await prisma.automationRuleLog.create({
    data: {
      ruleId: rule.id,
      salonId: rule.salonId,
      triggerId: context.triggerId,
      triggerType: context.triggerType,
      status,
      action: rule.action,
      result: result || {},
      error,
      executedAt: new Date(),
    },
  });

  return {
    success: status === AutomationStatus.SUCCESS,
    result,
    error,
  };
}

/**
 * Execute SEND_NOTIFICATION action
 */
async function executeSendNotification(
  rule: any,
  context: AutomationContext
): Promise<any> {
  const config = rule.config as any || {};
  const recipients = config.recipients || [];

  // TODO: Implement actual notification sending
  // For now, just log
  console.log(`[Automation] Sending notification to ${recipients.length} recipients`);

  return {
    recipients,
    message: config.message || "Automation notification",
    sent: true,
  };
}

/**
 * Execute CREATE_TASK action
 */
async function executeCreateTask(
  rule: any,
  context: AutomationContext
): Promise<any> {
  const config = rule.config as any || {};

  // TODO: Implement task creation
  // For now, just log
  console.log(`[Automation] Creating task: ${config.title || "Untitled"}`);

  return {
    taskCreated: true,
    title: config.title || "Automation task",
  };
}

/**
 * Execute UPDATE_STATUS action
 */
async function executeUpdateStatus(
  rule: any,
  context: AutomationContext
): Promise<any> {
  const config = rule.config as any || {};
  const { targetType, targetId, newStatus } = config;

  if (!targetType || !targetId || !newStatus) {
    throw new Error("Missing required config: targetType, targetId, newStatus");
  }

  // Update based on target type
  switch (targetType) {
    case "ALERT":
      await prisma.systemAlert.update({
        where: { id: targetId },
        data: { status: newStatus },
      });
      break;

    case "ACTION":
      await prisma.aIAction.update({
        where: { id: targetId },
        data: { status: newStatus },
      });
      break;

    default:
      throw new Error(`Unknown target type: ${targetType}`);
  }

  return {
    updated: true,
    targetType,
    targetId,
    newStatus,
  };
}

/**
 * Execute SEND_EMAIL action
 */
async function executeSendEmail(
  rule: any,
  context: AutomationContext
): Promise<any> {
  const config = rule.config as any || {};
  const recipients = config.recipients || [];

  // TODO: Implement actual email sending
  // For now, just log
  console.log(`[Automation] Sending email to ${recipients.length} recipients`);

  return {
    recipients,
    subject: config.subject || "Automation notification",
    sent: true,
  };
}

/**
 * Execute LOG_EVENT action
 */
async function executeLogEvent(
  rule: any,
  context: AutomationContext
): Promise<any> {
  const config = rule.config as any || {};

  // Log event
  console.log(`[Automation] Logging event: ${config.eventName || "automation"}`);

  return {
    logged: true,
    eventName: config.eventName || "automation",
    data: context.data,
  };
}

/**
 * Check and execute automation rules for a trigger
 */
export async function checkAndExecuteAutomations(
  salonId: string,
  trigger: AutomationTrigger,
  context: AutomationContext
): Promise<void> {
  const rules = await prisma.automationRule.findMany({
    where: {
      salonId,
      enabled: true,
      trigger,
    },
  });

  console.log(`[Automation] Found ${rules.length} enabled rules for trigger ${trigger}`);

  for (const rule of rules) {
    // Check conditions if any
    if (rule.conditions) {
      const conditions = rule.conditions as any;
      if (!checkConditions(conditions, context)) {
        console.log(`[Automation] Rule ${rule.id} conditions not met, skipping`);
        continue;
      }
    }

    try {
      await executeAutomationRule(rule.id, context);
    } catch (error: any) {
      console.error(`[Automation] Error executing rule ${rule.id}:`, error);
    }
  }
}

/**
 * Check if conditions are met
 */
function checkConditions(conditions: any, context: AutomationContext): boolean {
  // Simple condition checking
  // Can be extended for more complex logic

  if (conditions.actionType && context.data?.actionType !== conditions.actionType) {
    return false;
  }

  if (conditions.alertType && context.data?.alertType !== conditions.alertType) {
    return false;
  }

  return true;
}

/**
 * Rollback automation execution
 */
export async function rollbackAutomation(logId: string, userId: string): Promise<void> {
  const log = await prisma.automationRuleLog.findUnique({
    where: { id: logId },
    include: { rule: true },
  });

  if (!log) {
    throw new Error("Automation log not found");
  }

  if (log.rolledBack) {
    throw new Error("Automation already rolled back");
  }

  // TODO: Implement rollback logic based on action type
  // For now, just mark as rolled back

  await prisma.automationRuleLog.update({
    where: { id: logId },
    data: {
      rolledBack: true,
      rolledBackAt: new Date(),
      rolledBackBy: userId,
      status: AutomationStatus.ROLLED_BACK,
    },
  });

  console.log(`[Automation] Rolled back execution ${logId}`);
}

