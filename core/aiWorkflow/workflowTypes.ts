// ============================================
// AI Workflow Types
// ============================================

export type WorkflowType =
  | "stylist-coach"
  | "booking-optimizer"
  | "sop-assistant"
  | "customer-insight"
  | "marketing-content";

export interface WorkflowPayload {
  [key: string]: any;
}

export interface WorkflowResult {
  success: boolean;
  output: any;
}

