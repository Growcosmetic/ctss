// ============================================
// PHASE 34D - Auto Upgrade/Downgrade
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/membership/tier/check-upgrade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    // Get membership
    const membership = await prisma.customerMembership.findUnique({
      where: { customerId },
    });

    if (!membership) {
      return errorResponse("Membership not found", 404);
    }

    // Get all tiers
    const allTiers = await prisma.membershipTier.findMany({
      orderBy: { tierOrder: "asc" },
    });

    // Get current tier info
    const currentTier = allTiers.find(t => t.tierLevel === membership.currentTier);
    if (!currentTier) {
      return errorResponse("Current tier not found", 404);
    }

    // Calculate period for checking
    const periodStart = membership.periodStart || new Date(Date.now() - currentTier.periodMonths * 30 * 24 * 60 * 60 * 1000);
    const periodEnd = membership.periodEnd || new Date();

    // Check if we need to recalculate period spending
    let periodSpending = membership.periodSpending;

    // Get spending in the period
    const revenues = await prisma.revenue.findMany({
      where: {
        customerId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
        source: "SERVICE",
      },
    });

    const actualPeriodSpending = revenues.reduce((sum, r) => sum + r.amount, 0);

    // Update period spending if needed
    if (actualPeriodSpending !== periodSpending) {
      periodSpending = actualPeriodSpending;
      await prisma.customerMembership.update({
        where: { id: membership.id },
        data: {
          periodSpending: actualPeriodSpending,
        },
      });
    }

    // Find eligible tier
    let newTier = currentTier;
    let changeType = "MAINTAIN";

    // Check for upgrade (higher tiers)
    for (let i = allTiers.length - 1; i >= 0; i--) {
      const tier = allTiers[i];
      if (tier.tierOrder <= currentTier.tierOrder) break;

      // Check if customer qualifies
      if (periodSpending >= tier.minSpending) {
        if (tier.minVisits && membership.periodVisits < tier.minVisits) continue;
        newTier = tier;
        changeType = "UPGRADE";
        break;
      }
    }

    // Check for downgrade (lower tiers)
    if (changeType === "MAINTAIN") {
      for (let i = 0; i < allTiers.length; i++) {
        const tier = allTiers[i];
        if (tier.tierOrder >= currentTier.tierOrder) break;

        // Check if customer no longer qualifies for current tier
        if (periodSpending < currentTier.minSpending) {
          // Check if they qualify for this lower tier
          if (periodSpending >= tier.minSpending) {
            newTier = tier;
            changeType = "DOWNGRADE";
            break;
          }
        }
      }

      // If doesn't qualify for current tier, find appropriate tier
      if (periodSpending < currentTier.minSpending) {
        for (let i = allTiers.length - 1; i >= 0; i--) {
          const tier = allTiers[i];
          if (periodSpending >= tier.minSpending) {
            newTier = tier;
            if (tier.tierOrder < currentTier.tierOrder) {
              changeType = "DOWNGRADE";
            }
            break;
          }
        }
      }
    }

    // Update tier if changed
    if (newTier.tierLevel !== membership.currentTier) {
      // Record tier change history
      await prisma.tierUpgradeHistory.create({
        data: {
          customerId,
          membershipId: membership.id,
          previousTier: membership.currentTier,
          newTier: newTier.tierLevel,
          changeType,
          reason: `Automatic ${changeType.toLowerCase()} based on spending`,
          triggerType: "AUTO",
          criteria: {
            periodSpending,
            minSpending: newTier.minSpending,
            periodVisits: membership.periodVisits,
          },
          spendingAtChange: periodSpending,
          visitsAtChange: membership.periodVisits,
          pointsAtChange: membership.currentPoints,
        },
      });

      // Update membership
      const updatedMembership = await prisma.customerMembership.update({
        where: { id: membership.id },
        data: {
          currentTier: newTier.tierLevel,
          tierUpgradedAt: new Date(),
        },
      });

      return successResponse({
        changed: true,
        previousTier: membership.currentTier,
        newTier: newTier.tierLevel,
        changeType,
        membership: updatedMembership,
      });
    }

    return successResponse({
      changed: false,
      currentTier: membership.currentTier,
      periodSpending,
      minSpendingForNextTier: currentTier ? allTiers
        .find(t => t.tierOrder === currentTier.tierOrder + 1)?.minSpending || null : null,
    });
  } catch (error: any) {
    console.error("Error checking tier upgrade:", error);
    return errorResponse(error.message || "Failed to check tier upgrade", 500);
  }
}

