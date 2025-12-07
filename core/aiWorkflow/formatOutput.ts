// ============================================
// Output Formatter
// ============================================

import { WorkflowType } from "./workflowTypes";

export function formatOutput(type: WorkflowType, rawOutput: string) {
  try {
    // Remove markdown code blocks if present
    const cleaned = rawOutput
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error("Lỗi format output:", err);
    return { raw: rawOutput };
  }
}

