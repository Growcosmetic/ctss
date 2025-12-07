// ============================================
// Follow-up Engine
// Main logic to process and send follow-ups
// ============================================

import { prisma } from "@/lib/prisma";
import { followUpRules, getRulesForDay, ruleApplies } from "./rules";
import { generateFollowUpMessage } from "./messageGenerator";
import type { FollowUpMessage, FollowUpJobResult } from "./types";

// ============================================
// Process Follow-ups for All Customers
// ============================================

export async function processFollowUps(): Promise<FollowUpJobResult> {
  const result: FollowUpJobResult = {
    processed: 0,
    sent: 0,
    failed: 0,
    messages: [],
  };

  try {
    // Get all customers with profiles
    const customers = await prisma.customerProfile.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            journeyState: true,
            bookings: {
              orderBy: { date: "desc" },
              take: 1,
              select: { date: true, service: { select: { name: true } } },
            },
          },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const profile of customers) {
      result.processed++;

      // Skip if no booking history
      const bookingHistory = Array.isArray(profile.bookingHistory)
        ? (profile.bookingHistory as any[])
        : [];
      
      if (bookingHistory.length === 0) continue;

      // Get last booking from profile or customer bookings
      const lastBookingFromHistory = bookingHistory[bookingHistory.length - 1];
      const lastCustomerBooking = profile.customer?.bookings?.[0];

      let lastBookingDate: Date | null = null;

      if (lastCustomerBooking) {
        lastBookingDate = new Date(lastCustomerBooking.date);
      } else if (lastBookingFromHistory?.date) {
        lastBookingDate = new Date(lastBookingFromHistory.date);
      }

      if (!lastBookingDate) continue;

      // Calculate days since last booking
      const diffTime = today.getTime() - lastBookingDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Get applicable rules for this day
      const applicableRules = getRulesForDay(diffDays);

      for (const rule of applicableRules) {
        // Check if rule applies to this customer
        const customerData = {
          journeyState: profile.journeyState || profile.customer?.journeyState,
          totalVisits: bookingHistory.length,
        };

        if (!ruleApplies(rule, customerData)) continue;

        // Check if we already sent this follow-up
        const alreadySent = await checkFollowUpSent(
          profile.customerId,
          rule.id
        );
        if (alreadySent) continue;

        // Generate message
        try {
          const lastService = lastCustomerBooking
            ? {
                name: lastCustomerBooking.service?.name || "Dịch vụ",
                date: lastBookingDate.toISOString(),
              }
            : lastBookingFromHistory
            ? {
                name: lastBookingFromHistory.serviceName || lastBookingFromHistory.service?.name || "Dịch vụ",
                date: typeof lastBookingFromHistory.date === 'string' 
                  ? lastBookingFromHistory.date 
                  : new Date(lastBookingFromHistory.date).toISOString(),
              }
            : undefined;

          const message = await generateFollowUpMessage({
            phone: profile.phone || profile.customer?.phone,
            customerName: profile.name || profile.customer?.name,
            type: rule.messageType,
            history: profile,
            lastService,
          });

          // Create follow-up record
          const followUpRecord = await prisma.followUpMessage.create({
            data: {
              customerId: profile.customerId,
              phone: profile.phone || profile.customer.phone || null,
              ruleId: rule.id,
              messageType: rule.messageType,
              message,
              scheduledFor: new Date(),
              status: "pending",
            },
          });

          result.messages.push({
            customerId: profile.customerId,
            phone: profile.phone || profile.customer?.phone,
            ruleId: rule.id,
            messageType: rule.messageType,
            message,
            sentAt: new Date(),
            status: "pending",
          });

          // Send message via channel (async, non-blocking)
          sendFollowUpMessage(followUpRecord.id, message, profile).catch(
            (err) => {
              console.error("Failed to send follow-up:", err);
            }
          );
        } catch (error: any) {
          console.error(
            `Failed to process follow-up for customer ${profile.customerId}:`,
            error
          );
          result.failed++;
        }
      }
    }

    return result;
  } catch (error: any) {
    console.error("Follow-up processing error:", error);
    throw error;
  }
}

// ============================================
// Check if Follow-up Already Sent
// ============================================

async function checkFollowUpSent(
  customerId: string,
  ruleId: string
): Promise<boolean> {
  const existing = await prisma.followUpMessage.findFirst({
    where: {
      customerId,
      ruleId,
      status: "sent",
    },
  });

  return !!existing;
}

// ============================================
// Send Follow-up Message via Channel
// ============================================

async function sendFollowUpMessage(
  followUpId: string,
  message: string,
  profile: any
) {
  try {
    const phone = profile.phone || profile.customer?.phone;
    if (!phone) {
      throw new Error("No phone number for customer");
    }

    // Skip if customer has no profile.customer
    if (!profile.customerId) {
      throw new Error("No customer ID");
    }

    // Determine preferred channel (default: website/zalo)
    // In production, you'd check customer preference
    const channel = "zalo"; // or detect from profile.chatHistory

    // Send via channel intake API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/channel/intake`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: channel,
          customerId: profile.customerId,
          phone,
          message,
          metadata: {
            type: "followup",
            followUpId,
          },
        }),
      }
    );

    if (response.ok) {
      // Update follow-up status to sent
      await prisma.followUpMessage.update({
        where: { id: followUpId },
        data: {
          status: "sent",
          sentAt: new Date(),
          channel,
        },
      });
    } else {
      throw new Error("Failed to send via channel");
    }
  } catch (error: any) {
    // Update status to failed
    await prisma.followUpMessage
      .update({
        where: { id: followUpId },
        data: {
          status: "failed",
        },
      })
      .catch(() => {
        // Ignore update error
      });

    throw error;
  }
}

