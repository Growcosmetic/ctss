// ============================================
// Automation - Trigger Visit-based Flows
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAutomationFlow } from "@/core/automation/runFlow";

/**
 * Trigger automation flows when a visit is created
 */
export async function POST(req: Request) {
  try {
    const { customerId, visitId, service } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Get all active visit-based flows
    const flows = await prisma.automationFlow.findMany({
      where: {
        active: true,
        trigger: "visit",
      },
    });

    if (flows.length === 0) {
      return NextResponse.json({
        success: true,
        triggered: 0,
        message: "No visit-based flows found",
      });
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

    const results = {
      triggered: 0,
      executed: 0,
      errors: [] as any[],
    };

    // Run each matching flow
    for (const flow of flows) {
      try {
        const result = await runAutomationFlow(
          flow,
          customer,
          visits,
          tags,
          insight
        );

        if (result.success && result.executed > 0) {
          results.triggered++;
          results.executed += result.executed;
        }

        if (result.errors.length > 0) {
          results.errors.push(...result.errors);
        }
      } catch (err: any) {
        results.errors.push({
          flowId: flow.id,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Triggered ${results.triggered} flows, executed ${results.executed} actions`,
    });
  } catch (err: any) {
    console.error("Trigger visit automation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to trigger visit automation",
      },
      { status: 500 }
    );
  }
}

