// ============================================
// Customer Journey Types
// ============================================

export type CustomerJourneyState =
  | "AWARENESS"
  | "CONSIDERATION"
  | "BOOKING"
  | "IN_SALON"
  | "POST_SERVICE"
  | "RETENTION";

export interface JourneyTransition {
  from: CustomerJourneyState;
  to: CustomerJourneyState;
  condition: string;
  event: string;
}

export interface JourneyStateMachine {
  currentState: CustomerJourneyState;
  transitions: Record<CustomerJourneyState, CustomerJourneyState[]>;
}

export interface JourneyEvent {
  customerId: string;
  event: string;
  metadata?: any;
}

