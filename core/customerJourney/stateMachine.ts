// ============================================
// Customer Journey State Machine
// ============================================

import type {
  CustomerJourneyState,
  JourneyStateMachine,
  JourneyEvent,
} from "./types";

// ============================================
// State Transitions Map
// ============================================

export const JOURNEY_TRANSITIONS: Record<
  CustomerJourneyState,
  CustomerJourneyState[]
> = {
  AWARENESS: ["CONSIDERATION"],
  CONSIDERATION: ["BOOKING"],
  BOOKING: ["IN_SALON"],
  IN_SALON: ["POST_SERVICE"],
  POST_SERVICE: ["RETENTION"],
  RETENTION: ["CONSIDERATION"],
};

// ============================================
// Event to State Mapping
// ============================================

export const EVENT_TO_STATE_MAP: Record<string, CustomerJourneyState> = {
  "customer-asks-question": "CONSIDERATION",
  "customer-clicks-consult": "CONSIDERATION",
  "customer-requests-booking": "BOOKING",
  "customer-confirms-booking": "BOOKING",
  "customer-arrives-salon": "IN_SALON",
  "service-completed": "POST_SERVICE",
  "follow-up-sent": "POST_SERVICE",
  "customer-feedback-positive": "RETENTION",
  "next-service-predicted": "RETENTION",
  "retention-period-complete": "CONSIDERATION",
};

// ============================================
// Get Next State
// ============================================

export function getNextState(
  currentState: CustomerJourneyState,
  event: string
): CustomerJourneyState | null {
  // Check if event maps directly to a state
  if (EVENT_TO_STATE_MAP[event]) {
    const targetState = EVENT_TO_STATE_MAP[event];
    // Verify it's a valid transition
    const validTransitions = JOURNEY_TRANSITIONS[currentState];
    if (validTransitions.includes(targetState)) {
      return targetState;
    }
  }

  // Default: move to next state in sequence (if valid)
  const validTransitions = JOURNEY_TRANSITIONS[currentState];
  return validTransitions[0] || null;
}

// ============================================
// Can Transition
// ============================================

export function canTransition(
  from: CustomerJourneyState,
  to: CustomerJourneyState
): boolean {
  const validTransitions = JOURNEY_TRANSITIONS[from];
  return validTransitions.includes(to);
}

// ============================================
// Get State Machine Config
// ============================================

export function getStateMachineConfig(
  currentState: CustomerJourneyState
): JourneyStateMachine {
  return {
    currentState,
    transitions: JOURNEY_TRANSITIONS,
  };
}

