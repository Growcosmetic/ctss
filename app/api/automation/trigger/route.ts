// ============================================
// Automation - Trigger Flow
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAutomationFlow } from "@/core/automation/runFlow";

export async function POST(req: Request) {
  try {
    const { flowId, customerId } = await req.json();

    if (!flowId || !customerId) {
      return NextResponse.json(
        { error: "flowId and customerId are required" },
        { status: 400 }
      );
    }

    // Get flow
    const flow = // @ts-ignore - automationFlow may not be generated yet
      await
        prisma.automationFlow.findUnique({
          where: { id: flowId },
        });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get visits
    const visits = await prisma.visit.findMany({
      where: { customerId },
      orderBy: { date: "desc" },
      take: 10,
    });

    // Get tags
    const tags = await prisma.customerTag.findMany({
      where: { customerId },
    });

    // Get insight
    const insight = await prisma.customerInsight.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // Run flow
    const result = await runAutomationFlow(
      flow as any,
      customer,
      visits,
      tags,
      insight
    );

    return NextResponse.json({
      success: result.success,
      executed: result.executed,
      errors: result.errors,
      message: `Flow "${flow.name}" executed: ${result.executed} actions`,
    });
  } catch (err: any) {
    console.error("Trigger automation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to trigger automation",
      },
      { status: 500 }
    );
  }
}

