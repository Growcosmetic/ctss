// ============================================
// Customer Memory Service
// ============================================

import { prisma } from "@/lib/prisma";
import { customerMemorySummaryPrompt } from "../prompts/customerMemorySummaryPrompt";
import { callAI } from "../aiWorkflow/callAI";
import { formatOutput } from "../aiWorkflow/formatOutput";

// ============================================
// Get Customer Memory Summary
// ============================================

export async function getCustomerMemorySummary(customerId: string) {
  try {
    // Get customer profile
    const profile = await prisma.customerProfile.findUnique({
      where: { customerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            journeyState: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error(`Customer profile not found: ${customerId}`);
    }

    // Build prompt
    const promptText = customerMemorySummaryPrompt(profile);

    // Call AI
    const rawOutput = await callAI(promptText);

    // Format output
    const summary = formatOutput("customer-insight", rawOutput);

    return {
      profile,
      summary,
    };
  } catch (error: any) {
    console.error("Failed to get customer memory summary:", error);
    throw error;
  }
}

// ============================================
// Get Customer Profile with Memory
// ============================================

export async function getCustomerProfile(customerId: string) {
  try {
    const profile = await prisma.customerProfile.findUnique({
      where: { customerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            journeyState: true,
            createdAt: true,
            birthday: true,
            gender: true,
            notes: true,
          },
        },
      },
    });

    return profile;
  } catch (error: any) {
    console.error("Failed to get customer profile:", error);
    throw error;
  }
}

