// ============================================
// Message Router
// Route messages to appropriate AI workflows based on content
// ============================================

import type { UnifiedMessage } from "./types";

export interface RoutingDecision {
  workflowType: "customer-insight" | "stylist-coach" | "booking-optimizer" | "sop-assistant";
  intent: string;
  confidence: number;
}

// ============================================
// Detect Intent from Message
// ============================================

export function detectIntent(message: string): RoutingDecision {
  const lowerMessage = message.toLowerCase();

  // Stylist Coach Intent
  if (
    lowerMessage.includes("phân tích tóc") ||
    lowerMessage.includes("uốn được không") ||
    lowerMessage.includes("tóc này có làm được") ||
    lowerMessage.includes("có nên uốn") ||
    lowerMessage.includes("có nên nhuộm") ||
    lowerMessage.includes("gợi ý kỹ thuật") ||
    lowerMessage.includes("tóc khô") ||
    lowerMessage.includes("tóc hư tổn") ||
    lowerMessage.includes("lời khuyên stylist")
  ) {
    return {
      workflowType: "stylist-coach",
      intent: "technical_consultation",
      confidence: 0.9,
    };
  }

  // Booking Intent
  if (
    lowerMessage.includes("đặt lịch") ||
    lowerMessage.includes("có lịch trống") ||
    lowerMessage.includes("book") ||
    lowerMessage.includes("đặt hẹn") ||
    lowerMessage.includes("khi nào rảnh") ||
    lowerMessage.includes("giờ mở cửa")
  ) {
    return {
      workflowType: "booking-optimizer",
      intent: "booking_request",
      confidence: 0.9,
    };
  }

  // SOP Assistant Intent
  if (
    lowerMessage.includes("quy trình") ||
    lowerMessage.includes("sop") ||
    lowerMessage.includes("cách làm") ||
    lowerMessage.includes("bước nào")
  ) {
    return {
      workflowType: "sop-assistant",
      intent: "sop_inquiry",
      confidence: 0.8,
    };
  }

  // Default: Customer Insight (general conversation)
  return {
    workflowType: "customer-insight",
    intent: "general_inquiry",
    confidence: 0.7,
  };
}

// ============================================
// Route Message to Workflow
// ============================================

export function routeMessage(message: UnifiedMessage): RoutingDecision {
  return detectIntent(message.message);
}

