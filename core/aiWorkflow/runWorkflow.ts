// ============================================
// Workflow Runner Wrapper
// ============================================

import { WorkflowType, WorkflowPayload } from "./workflowTypes";
import { validateInput } from "./validateInput";
import { buildPrompt } from "./buildPrompt";
import { callAI } from "./callAI";
import { formatOutput } from "./formatOutput";
import { saveWorkflow, saveWorkflowError } from "./saveWorkflow";
import { transitionFromWorkflow } from "@/core/customerJourney/transitionEngine";
import { updateCustomerMemory } from "./updateCustomerMemory";

export async function runWorkflow(type: WorkflowType, payload: WorkflowPayload) {
  try {
    // 1) VALIDATE
    const validInput = validateInput(type, payload);

    // 2) PROMPT BUILDER
    const promptText = buildPrompt(type, validInput);

    // 3) CALL AI
    const rawOutput = await callAI(promptText);

    // 4) FORMATTER
    const formattedOutput = formatOutput(type, rawOutput);

    // 5) SAVE LOG
    await saveWorkflow({
      type,
      input: validInput,
      output: formattedOutput
    });

    // 6) AUTO-TRANSITION CUSTOMER JOURNEY (if customerId exists)
    if (payload.customerId) {
      transitionFromWorkflow(payload.customerId, type).catch((err) => {
        console.error("Failed to transition customer journey:", err);
        // Don't throw - journey transition failure shouldn't break workflow
      });
    }

    // 7) UPDATE CUSTOMER MEMORY (if customerId or phone exists)
    updateCustomerMemory({
      customerId: payload.customerId,
      customerPhone: payload.phone || payload.customerPhone,
      type,
      input: validInput,
      output: formattedOutput,
    }).catch((err) => {
      console.error("Failed to update customer memory:", err);
      // Don't throw - memory update failure shouldn't break workflow
    });

    return formattedOutput;
  } catch (error: any) {
    // Save error to database
    await saveWorkflowError({
      type,
      input: payload,
      error: error.message || "Unknown error",
      rawOutput: error.rawOutput || ""
    });

    throw error;
  }
}

