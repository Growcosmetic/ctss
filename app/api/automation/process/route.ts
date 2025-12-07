// ============================================
// Automation - Process Triggers (Cron Job)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAutomationFlow } from "@/core/automation/runFlow";

/**
 * Process time-based automations
 * Should be called by cron job (every hour or every 15 minutes)
 */
export async function POST(req: Request) {
  try {
    const results = {
      processed: 0,
      triggered: 0,
      errors: [] as any[],
    };

    // Get all active flows with time-based triggers
    // @ts-ignore - automationFlow may not be generated yet
    const flows = await prisma.automationFlow.findMany({
      where: {
        active: true,
        trigger: "time",
      },
    });

    // Get all customers
    const customers = await prisma.customer.findMany({
      take: 100, // Process max 100 at a time
    });

    for (const customer of customers) {
      for (const flow of flows) {
        try {
          // Get customer data
          const visits = await prisma.visit.findMany({
            where: { customerId: customer.id },
            orderBy: { date: "desc" },
            take: 10,
          });

          const tags = await prisma.customerTag.findMany({
            where: { customerId: customer.id },
          });

          const insight = await prisma.customerInsight.findFirst({
            where: { customerId: customer.id },
            orderBy: { createdAt: "desc" },
          });

          // Run flow
          const result = await runAutomationFlow(
            flow,
            customer,
            visits,
            tags,
            insight
          );

          results.processed++;
          if (result.success && result.executed > 0) {
            results.triggered++;
          }
        } catch (err: any) {
          results.errors.push({
            customerId: customer.id,
            flowId: flow.id,
            error: err.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Processed ${results.processed} customer-flow combinations, triggered ${results.triggered}`,
    });
  } catch (err: any) {
    console.error("Process automation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process automations",
      },
      { status: 500 }
    );
  }
}

