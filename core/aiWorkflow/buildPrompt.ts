// ============================================
// Prompt Builder
// ============================================

import { WorkflowType, WorkflowPayload } from "./workflowTypes";
import { stylistCoachPrompt } from "@/core/prompts/stylistCoachPrompt";
import { bookingOptimizerPrompt } from "@/core/prompts/bookingOptimizerPrompt";
import { sopAssistantPrompt } from "@/core/prompts/sopAssistantPrompt";
import { customerInsightPrompt } from "@/core/prompts/customerInsightPrompt";
import { marketingContentPrompt } from "@/core/prompts/marketingContentPrompt";

export function buildPrompt(type: WorkflowType, payload: WorkflowPayload) {
  switch (type) {
    case "stylist-coach":
      return stylistCoachPrompt(payload);

    case "booking-optimizer":
      return bookingOptimizerPrompt(payload);

    case "sop-assistant":
      return sopAssistantPrompt(payload);

    case "customer-insight":
      return customerInsightPrompt(payload);

    default:
      throw new Error("Chưa có prompt cho workflow này");
  }
}

