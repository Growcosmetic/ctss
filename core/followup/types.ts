// ============================================
// Follow-up Engine Types
// ============================================

export type FollowUpMessageType =
  | "thank_you"
  | "check_health"
  | "care_tip"
  | "light_upsell"
  | "booking_reminder"
  | "return_offer"
  | "churn_prevention";

export type FollowUpTrigger = "POST_SERVICE" | "RETENTION" | "CHURN_RISK";

export interface FollowUpRule {
  id: string;
  daysAfter: number;
  trigger: FollowUpTrigger;
  messageType: FollowUpMessageType;
  enabled?: boolean;
  conditions?: {
    minVisits?: number;
    journeyState?: string[];
    excludeJourneyState?: string[];
  };
}

export interface FollowUpMessage {
  customerId: string;
  phone?: string;
  ruleId: string;
  messageType: FollowUpMessageType;
  message: string;
  sentAt: Date;
  status: "pending" | "sent" | "failed";
  channel?: "zalo" | "facebook" | "instagram" | "website" | "sms";
}

export interface FollowUpJobResult {
  processed: number;
  sent: number;
  failed: number;
  messages: FollowUpMessage[];
}

