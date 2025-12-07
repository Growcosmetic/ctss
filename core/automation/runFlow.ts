// ============================================
// Automation Workflow Engine
// ============================================

import { prisma } from "@/lib/prisma";

interface Customer {
  id: string;
  name: string;
  phone: string;
  [key: string]: any;
}

interface Visit {
  id: string;
  date: Date;
  service: string;
  [key: string]: any;
}

interface Tag {
  tag: string;
  category?: string | null;
  [key: string]: any;
}

interface Insight {
  churnRisk?: string;
  nextService?: string;
  promotion?: string;
  [key: string]: any;
}

interface AutomationFlow {
  id: string;
  name: string;
  trigger: string;
  conditions: any;
  actions: any[];
  active: boolean;
}

/**
 * Send message via channel
 */
async function sendMessage(
  customer: Customer,
  channel: string,
  message: string
): Promise<boolean> {
  try {
    // TODO: Integrate with actual messaging APIs
    console.log(`[${channel}] Sending to ${customer.phone}: ${message}`);
    
    // Placeholder: In production, call actual API:
    // - Zalo: https://openapi.zalo.me/v2.0/oa/message
    // - Facebook: https://graph.facebook.com/v18.0/me/messages
    // - SMS: Call SMS gateway API
    
    return true;
  } catch (err) {
    console.error("Send message error:", err);
    return false;
  }
}

/**
 * Create reminder
 */
async function createReminder(
  customerId: string,
  payload: {
    type: string;
    sendAt: Date | string;
    message: string;
    channel?: string;
  }
): Promise<boolean> {
  try {
    await prisma.reminder.create({
      data: {
        customerId,
        type: payload.type,
        sendAt: new Date(payload.sendAt),
        channel: payload.channel || "zalo",
        message: payload.message,
      },
    });
    return true;
  } catch (err) {
    console.error("Create reminder error:", err);
    return false;
  }
}

/**
 * Update customer data
 */
async function updateCustomerData(
  customerId: string,
  data: any
): Promise<boolean> {
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data,
    });
    return true;
  } catch (err) {
    console.error("Update customer error:", err);
    return false;
  }
}

/**
 * Create visit note
 */
async function createVisitNote(
  customerId: string,
  visitId: string,
  note: string
): Promise<boolean> {
  try {
    await prisma.visit.update({
      where: { id: visitId },
      data: {
        notes: note,
      },
    });
    return true;
  } catch (err) {
    console.error("Create visit note error:", err);
    return false;
  }
}

/**
 * Assign preferred stylist
 */
async function assignPreferredStylist(
  customerId: string,
  stylist: string
): Promise<boolean> {
  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: { preferredStylist: stylist },
    });
    return true;
  } catch (err) {
    console.error("Assign stylist error:", err);
    return false;
  }
}

/**
 * Trigger AI Insight generation
 */
async function triggerAIInsight(customerId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/crm/insight/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, forceRefresh: true }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error("Trigger AI insight error:", err);
    return false;
  }
}

/**
 * Add/Remove tag
 */
async function manageTag(
  customerId: string,
  tag: string,
  action: "add" | "remove"
): Promise<boolean> {
  try {
    if (action === "add") {
      await prisma.customerTag.create({
        data: {
          customerId,
          tag,
          category: null,
        },
      });
    } else {
      await prisma.customerTag.deleteMany({
        where: { customerId, tag },
      });
    }
    return true;
  } catch (err) {
    console.error("Manage tag error:", err);
    return false;
  }
}

/**
 * Run automation flow
 */
export async function runAutomationFlow(
  flow: AutomationFlow,
  customer: Customer,
  visits: Visit[],
  tags: Tag[],
  insight: Insight | null
): Promise<{ success: boolean; executed: number; errors: any[] }> {
  if (!flow.active) {
    return { success: false, executed: 0, errors: ["Flow is inactive"] };
  }

  const results = {
    success: true,
    executed: 0,
    errors: [] as any[],
  };

  // Check conditions
  if (!checkConditions(flow.conditions, customer, visits, tags, insight)) {
    return {
      success: false,
      executed: 0,
      errors: ["Conditions not met"],
    };
  }

  // Execute actions
  for (const action of flow.actions) {
    try {
      let success = false;

      switch (action.type) {
        case "sendMessage":
          success = await sendMessage(
            customer,
            action.channel || "zalo",
            action.message || ""
          );
          break;

        case "createReminder":
          success = await createReminder(customer.id, action.payload);
          break;

        case "updateCustomer":
          success = await updateCustomerData(customer.id, action.payload);
          break;

        case "createVisitNote":
          if (visits.length > 0) {
            success = await createVisitNote(
              customer.id,
              visits[0].id,
              action.note || ""
            );
          }
          break;

        case "assignPreferredStylist":
          success = await assignPreferredStylist(
            customer.id,
            action.stylist || ""
          );
          break;

        case "triggerAIInsight":
          success = await triggerAIInsight(customer.id);
          break;

        case "addTag":
          success = await manageTag(customer.id, action.tag || "", "add");
          break;

        case "removeTag":
          success = await manageTag(customer.id, action.tag || "", "remove");
          break;

        default:
          console.warn(`Unknown action type: ${action.type}`);
      }

      // Log action
      await prisma.automationLog.create({
        data: {
          flowId: flow.id,
          customerId: customer.id,
          action: action.type,
          result: success ? "success" : "failed",
          metadata: action,
          error: success ? null : "Action execution failed",
        },
      });

      if (success) {
        results.executed++;
      } else {
        results.errors.push({ action: action.type, error: "Execution failed" });
        results.success = false;
      }
    } catch (err: any) {
      results.errors.push({ action: action.type, error: err.message });
      results.success = false;

      await prisma.automationLog.create({
        data: {
          flowId: flow.id,
          customerId: customer.id,
          action: action.type,
          result: "failed",
          metadata: action,
          error: err.message,
        },
      });
    }
  }

  return results;
}

/**
 * Check if conditions are met
 */
function checkConditions(
  conditions: any,
  customer: Customer,
  visits: Visit[],
  tags: Tag[],
  insight: Insight | null
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true; // No conditions = always true
  }

  // Check tag condition
  if (conditions.tag) {
    const hasTag = tags.some((t) => t.tag === conditions.tag);
    if (!hasTag) return false;
  }

  // Check tags condition (array)
  if (conditions.tags && Array.isArray(conditions.tags)) {
    const hasAllTags = conditions.tags.every((tag: string) =>
      tags.some((t) => t.tag === tag)
    );
    if (!hasAllTags) return false;
  }

  // Check service condition
  if (conditions.service && visits.length > 0) {
    const service = visits[0].service.toLowerCase();
    const requiredService = Array.isArray(conditions.service)
      ? conditions.service
      : [conditions.service];
    const hasService = requiredService.some((s: string) =>
      service.includes(s.toLowerCase())
    );
    if (!hasService) return false;
  }

  // Check churn risk condition
  if (conditions.churnRisk && insight) {
    if (insight.churnRisk !== conditions.churnRisk) return false;
  }

  // Check total visits condition
  if (conditions.minVisits !== undefined) {
    if (visits.length < conditions.minVisits) return false;
  }

  // Check total spent condition
  if (conditions.minSpent !== undefined) {
    if ((customer.totalSpent || 0) < conditions.minSpent) return false;
  }

  // Check days since last visit
  if (conditions.daysSinceLastVisit !== undefined && visits.length > 0) {
    const daysSince =
      (Date.now() - new Date(visits[0].date).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSince < conditions.daysSinceLastVisit) return false;
  }

  return true;
}

