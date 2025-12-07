// ============================================
// Customer Memory Update System
// ============================================

import { prisma } from "@/lib/prisma";

export interface UpdateMemoryParams {
  customerId?: string;
  customerPhone?: string;
  type: string;
  input: any;
  output: any;
}

// ============================================
// Update Customer Memory from Workflow
// ============================================

export async function updateCustomerMemory({
  customerId,
  customerPhone,
  type,
  input,
  output,
}: UpdateMemoryParams) {
  try {
    // Get customer ID from phone if needed
    if (customerPhone && !customerId) {
      const customer = await prisma.customer.findUnique({
        where: { phone: customerPhone },
        select: { id: true },
      });
      if (customer) {
        customerId = customer.id;
      }
    }

    if (!customerId) {
      return; // Skip if no customer ID
    }

    // Get or create profile
    let profile = await prisma.customerProfile.findUnique({
      where: { customerId },
    });

    const updates: any = {
      updatedAt: new Date(),
    };

    // Update based on workflow type
    if (type === "stylist-coach") {
      const technicalHistory = Array.isArray(profile?.technicalHistory)
        ? (profile.technicalHistory as any[])
        : [];

      updates.technicalHistory = [
        ...technicalHistory,
        {
          date: new Date().toISOString(),
          input,
          output,
        },
      ];
    }

    if (type === "booking-optimizer") {
      const bookingHistory = Array.isArray(profile?.bookingHistory)
        ? (profile.bookingHistory as any[])
        : [];

      updates.bookingHistory = [
        ...bookingHistory,
        {
          date: new Date().toISOString(),
          input,
          output,
        },
      ];
    }

    if (type === "customer-insight") {
      updates.insight = output;
    }

    if (type === "sop-assistant") {
      const hairHistory = Array.isArray(profile?.hairHistory)
        ? (profile.hairHistory as any[])
        : [];

      updates.hairHistory = [
        ...hairHistory,
        {
          date: new Date().toISOString(),
          input,
          output,
        },
      ];
    }

    // Upsert profile
    if (profile) {
      await prisma.customerProfile.update({
        where: { customerId },
        data: updates,
      });
      
      // Auto-trigger insight regeneration after memory update (optional)
      // Set ENABLE_AUTO_INSIGHT=false in .env to disable
      // Note: This will trigger insight regeneration in background
      // For better performance, you can call insight API manually when needed
      if (process.env.ENABLE_AUTO_INSIGHT === "true") {
        generateInsightInBackground(customerId).catch((err) => {
          console.error("Failed to auto-generate insight:", err);
        });
      }
    } else {
      // Get customer info for creation
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { name: true, phone: true, journeyState: true },
      });

      if (customer) {
        await prisma.customerProfile.create({
          data: {
            customerId,
            name: customer.name,
            phone: customer.phone || null,
            journeyState: customer.journeyState || "AWARENESS",
            ...updates,
          },
        });
        
        // Auto-trigger insight generation for new profiles (optional)
        if (process.env.ENABLE_AUTO_INSIGHT === "true") {
          generateInsightInBackground(customerId).catch((err) => {
            console.error("Failed to auto-generate insight:", err);
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to update customer memory:", error);
    // Don't throw - memory update failure shouldn't break workflow
  }
}

// ============================================
// Generate Insight in Background (Non-blocking)
// ============================================
// Note: This is optional. Set ENABLE_AUTO_INSIGHT=true in .env to enable.
// Alternatively, call insight API manually when needed.

async function generateInsightInBackground(customerId: string) {
  try {
    // Import insight generation logic directly (better than HTTP call)
    const { generateCustomerInsight } = await import(
      "@/core/customerJourney/insightGenerator"
    );
    await generateCustomerInsight(customerId);
  } catch (error) {
    // Silent fail - this is background job
    // If import fails, try HTTP fallback (only in production with proper URL)
    if (process.env.NODE_ENV === "production" && process.env.APP_URL) {
      try {
        await fetch(`${process.env.APP_URL}/api/customer/insight`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        });
      } catch (fetchError) {
        console.error("Background insight generation failed:", fetchError);
      }
    }
  }
}

