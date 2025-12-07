// ============================================
// Customer Journey Transition Engine
// ============================================

import { prisma } from "@/lib/prisma";
import { getNextState, canTransition } from "./stateMachine";
import type { CustomerJourneyState, JourneyEvent } from "./types";

export interface TransitionResult {
  success: boolean;
  previousState: CustomerJourneyState;
  newState: CustomerJourneyState;
  error?: string;
}

// ============================================
// Process Journey Event
// ============================================

export async function processJourneyEvent(
  event: JourneyEvent
): Promise<TransitionResult> {
  try {
    // Get current customer state
    const customer = await prisma.customer.findUnique({
      where: { id: event.customerId },
      select: { id: true, journeyState: true },
    });

    if (!customer) {
      throw new Error(`Customer not found: ${event.customerId}`);
    }

    const currentState = customer.journeyState as CustomerJourneyState;

    // Determine next state
    const nextState = getNextState(currentState, event.event);

    if (!nextState) {
      return {
        success: false,
        previousState: currentState,
        newState: currentState,
        error: `Invalid transition from ${currentState} with event ${event.event}`,
      };
    }

    // Verify transition is valid
    if (!canTransition(currentState, nextState)) {
      return {
        success: false,
        previousState: currentState,
        newState: currentState,
        error: `Cannot transition from ${currentState} to ${nextState}`,
      };
    }

    // Update customer state
    await prisma.customer.update({
      where: { id: event.customerId },
      data: { journeyState: nextState },
    });

    return {
      success: true,
      previousState: currentState,
      newState: nextState,
    };
  } catch (error: any) {
    throw new Error(`Failed to process journey event: ${error.message}`);
  }
}

// ============================================
// Auto-transition based on workflow type
// ============================================

export async function transitionFromWorkflow(
  customerId: string,
  workflowType: string
): Promise<TransitionResult | null> {
  // Map workflow types to journey events
  const workflowEventMap: Record<string, string> = {
    "stylist-coach": "service-completed",
    "booking-optimizer": "customer-confirms-booking",
    "customer-insight": "customer-feedback-positive",
  };

  const event = workflowEventMap[workflowType];

  if (!event) {
    return null; // No transition needed for this workflow
  }

  return processJourneyEvent({
    customerId,
    event,
  });
}

