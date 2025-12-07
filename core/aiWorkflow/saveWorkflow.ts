// ============================================
// Workflow Logger (Save to DB)
// ============================================

import { prisma } from "@/lib/prisma";

export async function saveWorkflow({ type, input, output }: {
  type: string;
  input: any;
  output: any;
}) {
  try {
    await prisma.workflowRun.create({
      data: {
        type,
        input,
        output,
      },
    });
  } catch (err) {
    console.log("Lỗi lưu workflow:", err);
  }
}

export async function saveWorkflowError({ type, input, error, rawOutput }: {
  type: string;
  input: any;
  error: string;
  rawOutput?: string | null;
}) {
  try {
    await prisma.workflowError.create({
      data: {
        type,
        input,
        error,
        rawOutput: rawOutput || null,
      },
    });
  } catch (err) {
    console.log("Lỗi lưu workflowError:", err);
  }
}

