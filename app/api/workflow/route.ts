// ============================================
// AI Workflow API Route - Unified Endpoint
// ============================================

import { NextResponse } from "next/server";
import { runWorkflow } from "@/core/aiWorkflow/runWorkflow";
import { WorkflowType } from "@/core/aiWorkflow/workflowTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    if (!type || !payload) {
      return NextResponse.json(
        { error: "Thiếu type hoặc payload." },
        { status: 400 }
      );
    }

    const allowedTypes: WorkflowType[] = [
      "stylist-coach",
      "booking-optimizer",
      "sop-assistant",
      "customer-insight",
      "marketing-content"
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: "Workflow type không hợp lệ." },
        { status: 400 }
      );
    }

    const result = await runWorkflow(type, payload);

    return NextResponse.json({
      success: true,
      type,
      result
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/workflow (Info endpoint)
export async function GET() {
  return NextResponse.json({
    message: "AI Workflow API - Unified Endpoint",
    description: "Unified AI workflow engine cho tất cả module AI của CTSS",
    supportedTypes: [
      "stylist-coach",
      "booking-optimizer",
      "sop-assistant",
      "customer-insight",
      "marketing-content",
    ],
    usage: {
      method: "POST",
      body: {
        type: "stylist-coach | booking-optimizer | sop-assistant | customer-insight | marketing-content",
        payload: "WorkflowPayload (varies by type)",
      },
    },
    example: {
      type: "stylist-coach",
      payload: {
        hairCondition: "...",
        hairHistory: "...",
        customerGoal: "..."
      }
    }
  });
}

