// ============================================
// Loyalty Engine
// ============================================

import { prisma } from "@/lib/prisma";
import { subMonths } from "date-fns";

// Default: 1 point per 10,000 VND
const POINTS_PER_AMOUNT = 10000;
const POINTS_RATE = 1;

/**
 * Calculate earned points from invoice
 */
export async function calculateEarnedPoints(
  invoiceId: string
): Promise<number> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        invoiceItems: {
          include: {
            service: true,
            product: true,
          },
        },
      },
    });

    if (!invoice || invoice.status !== "PAID") {
      return 0;
    }

    // Default: 1 point per 10,000 VND
    const totalAmount = Number(invoice.total);
    const points = Math.floor(totalAmount / POINTS_PER_AMOUNT) * POINTS_RATE;

    // TODO: Allow different rates per service type
    // For now, simple calculation

    return points;
  } catch (error) {
    console.error("Error calculating earned points:", error);
    return 0;
  }
}

/**
 * Calculate customer tier based on spending in last 6 months
 */
export async function calculateTier(customerId: string): Promise<string | null> {
  try {
    const sixMonthsAgo = subMonths(new Date(), 6);

    // Get total spending in last 6 months
    const invoices = await prisma.invoice.findMany({
      where: {
        customerId,
        status: "PAID",
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        total: true,
      },
    });

    const totalSpending = invoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0
    );

    // Get tiers ordered by minSpend (ascending)
    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: {
        order: "asc",
      },
    });

    // Find highest tier that customer qualifies for
    let matchingTier: any = null;
    for (const tier of tiers) {
      if (totalSpending >= Number(tier.minSpend)) {
        matchingTier = tier;
      } else {
        break;
      }
    }

    return matchingTier?.id || null;
  } catch (error) {
    console.error("Error calculating tier:", error);
    return null;
  }
}

/**
 * Add points to customer
 */
export async function addPoints(
  customerId: string,
  invoiceId: string
): Promise<number> {
  try {
    const points = await calculateEarnedPoints(invoiceId);
    if (points <= 0) {
      return 0;
    }

    // Create loyalty point entry
    await prisma.loyaltyPoint.create({
      data: {
        customerId,
        invoiceId,
        points,
        description: `Earned from invoice #${invoiceId.substring(0, 8)}`,
      },
    });

    // Update or create CustomerLoyalty
    const existing = await prisma.customerLoyalty.findUnique({
      where: { customerId },
    });

    if (existing) {
      await prisma.customerLoyalty.update({
        where: { customerId },
        data: {
          totalPoints: existing.totalPoints + points,
          lifetimePoints: existing.lifetimePoints + points,
        },
      });
    } else {
      await prisma.customerLoyalty.create({
        data: {
          customerId,
          totalPoints: points,
          lifetimePoints: points,
        },
      });
    }

    // Recalculate tier
    const newTierId = await calculateTier(customerId);
    if (newTierId) {
      await prisma.customerLoyalty.update({
        where: { customerId },
        data: { tierId: newTierId },
      });
    }

    return points;
  } catch (error) {
    console.error("Error adding points:", error);
    throw error;
  }
}

/**
 * Redeem points
 */
export async function redeemPoints(
  customerId: string,
  points: number,
  description?: string
): Promise<void> {
  try {
    const customerLoyalty = await prisma.customerLoyalty.findUnique({
      where: { customerId },
    });

    if (!customerLoyalty) {
      throw new Error("Customer loyalty not found");
    }

    if (customerLoyalty.totalPoints < points) {
      throw new Error("Insufficient points");
    }

    // Create negative loyalty point entry
    await prisma.loyaltyPoint.create({
      data: {
        customerId,
        points: -points,
        description: description || `Redeemed ${points} points`,
      },
    });

    // Update CustomerLoyalty
    await prisma.customerLoyalty.update({
      where: { customerId },
      data: {
        totalPoints: customerLoyalty.totalPoints - points,
      },
    });
  } catch (error) {
    console.error("Error redeeming points:", error);
    throw error;
  }
}

/**
 * Get tier benefits
 */
export async function getBenefits(customerId: string): Promise<any> {
  try {
    const customerLoyalty = await prisma.customerLoyalty.findUnique({
      where: { customerId },
      include: {
        tier: true,
      },
    });

    if (!customerLoyalty || !customerLoyalty.tier) {
      return {
        discountPercent: 0,
        perks: [],
      };
    }

    return {
      discountPercent: Number(customerLoyalty.tier.discountPercent),
      perks: customerLoyalty.tier.perks || [],
    };
  } catch (error) {
    console.error("Error getting benefits:", error);
    return {
      discountPercent: 0,
      perks: [],
    };
  }
}

/**
 * Get loyalty summary for customer
 */
export async function getLoyaltySummary(
  customerId: string
): Promise<any> {
  try {
    const customerLoyalty = await prisma.customerLoyalty.findUnique({
      where: { customerId },
      include: {
        tier: true,
        pointsHistory: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
    });

    if (!customerLoyalty) {
      // Create default
      await prisma.customerLoyalty.create({
        data: {
          customerId,
          totalPoints: 0,
          lifetimePoints: 0,
        },
      });
      return getLoyaltySummary(customerId); // Retry
    }

    // Get all tiers
    const allTiers = await prisma.loyaltyTier.findMany({
      orderBy: {
        order: "asc",
      },
    });

    // Find next tier
    const currentTier = customerLoyalty.tier;
    const currentTierIndex = currentTier
      ? allTiers.findIndex((t) => t.id === currentTier.id)
      : -1;
    const nextTier =
      currentTierIndex >= 0 && currentTierIndex < allTiers.length - 1
        ? allTiers[currentTierIndex + 1]
        : null;

    // Calculate spending in last 6 months
    const sixMonthsAgo = subMonths(new Date(), 6);
    const invoices = await prisma.invoice.findMany({
      where: {
        customerId,
        status: "PAID",
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        total: true,
      },
    });

    const spendingLast6Months = invoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0
    );

    // Calculate points to next tier
    const pointsToNextTier = nextTier
      ? Math.max(0, Number(nextTier.minSpend) - spendingLast6Months)
      : 0;

    return {
      customerLoyalty,
      currentTier: currentTier || null,
      nextTier: nextTier || null,
      pointsToNextTier,
      spendingLast6Months,
      pointsHistory: customerLoyalty.pointsHistory,
    };
  } catch (error) {
    console.error("Error getting loyalty summary:", error);
    throw error;
  }
}

