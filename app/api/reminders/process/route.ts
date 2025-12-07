// ============================================
// Reminders - Process & Send Reminders (Cron Job)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Send reminder via Zalo/FB/SMS
 * Placeholder - integrate with actual messaging APIs
 */
async function sendReminder(
  customerId: string,
  phone: string,
  message: string,
  channel: string
): Promise<boolean> {
  try {
    // TODO: Integrate with Zalo OA API / Facebook Messenger API / SMS Gateway
    console.log(`[${channel}] Sending to ${phone}: ${message}`);
    
    // Placeholder: Simulate sending
    // In production, call actual API:
    // - Zalo: https://openapi.zalo.me/v2.0/oa/message
    // - Facebook: https://graph.facebook.com/v18.0/me/messages
    // - SMS: Call SMS gateway API
    
    return true;
  } catch (err) {
    console.error("Send reminder error:", err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Get all unsent reminders that are due
    const now = new Date();
    const reminders = await prisma.reminder.findMany({
      where: {
        sent: false,
        sendAt: {
          lte: now,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      take: 50, // Process max 50 at a time
    });

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const reminder of reminders) {
      try {
        // Send reminder
        const success = await sendReminder(
          reminder.customerId,
          reminder.customer.phone,
          reminder.message,
          reminder.channel
        );

        // Update reminder status
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            sent: success,
            sentAt: success ? new Date() : null,
          },
        });

        results.processed++;
        if (success) {
          results.sent++;
        } else {
          results.failed++;
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push({
          reminderId: reminder.id,
          error: err.message,
        });
        console.error(`Error processing reminder ${reminder.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Processed ${results.processed} reminders: ${results.sent} sent, ${results.failed} failed`,
    });
  } catch (err: any) {
    console.error("Process reminders error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process reminders",
      },
      { status: 500 }
    );
  }
}

// GET endpoint để test
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const sent = searchParams.get("sent");
    const type = searchParams.get("type");

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (sent !== null) where.sent = sent === "true";
    if (type) where.type = type;

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { sendAt: "asc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      reminders,
      total: reminders.length,
    });
  } catch (err: any) {
    console.error("Get reminders error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get reminders",
      },
      { status: 500 }
    );
  }
}

