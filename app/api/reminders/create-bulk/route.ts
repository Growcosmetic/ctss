// ============================================
// Reminders - Create Reminders for All Customers (Bulk)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTags } from "@/core/crm/tagRules";
import { generateReminders } from "@/core/crm/reminderRules";

/**
 * Bulk create reminders for all customers
 * Useful for initial setup or batch processing
 */
export async function POST(req: Request) {
  try {
    const { limit = 100 } = await req.json();

    // Get all customers
    const customers = await prisma.customer.findMany({
      take: limit,
      select: {
        id: true,
        name: true,
        phone: true,
        totalVisits: true,
        totalSpent: true,
      },
    });

    const results = {
      processed: 0,
      created: 0,
      errors: [] as any[],
    };

    for (const customer of customers) {
      try {
        // Get visits
        const visits = await prisma.visit.findMany({
          where: { customerId: customer.id },
          orderBy: { date: "desc" },
        });

        if (visits.length === 0) continue;

        // Generate tags
        const tags = generateTags(customer, visits).map((t) => t.tag);

        // Generate reminders
        const reminders = generateReminders(customer, visits, tags);

        if (reminders.length > 0) {
          // Delete existing unsent reminders
          await prisma.reminder.deleteMany({
            where: {
              customerId: customer.id,
              sent: false,
            },
          });

          // Create new reminders
          await prisma.reminder.createMany({
            data: reminders.map((r) => ({
              customerId: customer.id,
              type: r.type,
              sendAt: r.sendAt,
              channel: r.channel || "zalo",
              message: r.message,
              metadata: r.metadata || null,
            })),
          });

          results.created += reminders.length;
        }

        results.processed++;
      } catch (err: any) {
        results.errors.push({
          customerId: customer.id,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Processed ${results.processed} customers, created ${results.created} reminders`,
    });
  } catch (err: any) {
    console.error("Bulk create reminders error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to bulk create reminders",
      },
      { status: 500 }
    );
  }
}

