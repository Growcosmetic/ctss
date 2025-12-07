// ============================================
// PHASE 34G - Membership Dashboard
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

function validateToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

// GET /api/membership/dashboard (for customer)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const type = searchParams.get("type") || "customer"; // customer | ceo

    // Customer dashboard
    if (type === "customer" && customerId) {
      const membership = await prisma.customerMembership.findUnique({
        where: { customerId },
      });

      if (!membership) {
        return successResponse({
          currentTier: "MEMBER",
          currentPoints: 0,
          nextTier: null,
          pointsToNextTier: null,
        });
      }

      // Get tier info
      const tiers = await prisma.membershipTier.findMany({
        orderBy: { tierOrder: "asc" },
      });

      const currentTier = tiers.find(t => t.tierLevel === membership.currentTier);
      const nextTier = tiers.find(t => t.tierOrder === (currentTier?.tierOrder || 0) + 1);

      // Calculate points needed for next tier
      const pointsToNextTier = nextTier
        ? Math.max(0, nextTier.minSpending - membership.periodSpending)
        : null;

      // Get available rewards
      const rewards = await prisma.rewardCatalog.findMany({
        where: {
          isActive: true,
          OR: [
            { eligibleTiers: { has: membership.currentTier } },
            { eligibleTiers: { isEmpty: true } },
          ],
          pointsRequired: { lte: membership.currentPoints },
        },
        orderBy: { pointsRequired: "asc" },
      });

      // Get redemption history
      const redemptions = await prisma.rewardRedemption.findMany({
        where: { customerId },
        include: { reward: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      // Get recent points transactions
      const transactions = await prisma.pointsTransaction.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      return successResponse({
        membership: {
          currentTier: membership.currentTier,
          currentPoints: membership.currentPoints,
          lifetimePoints: membership.lifetimePoints,
          totalSpending: membership.totalSpending,
          periodSpending: membership.periodSpending,
          totalVisits: membership.totalVisits,
        },
        tierInfo: {
          current: currentTier,
          next: nextTier,
          pointsToNextTier,
          progress: nextTier
            ? (membership.periodSpending / nextTier.minSpending) * 100
            : 100,
        },
        availableRewards: rewards,
        recentRedemptions: redemptions,
        recentTransactions: transactions,
      });
    }

    // CEO dashboard
    if (type === "ceo") {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;

      if (!token) {
        return errorResponse("Not authenticated", 401);
      }

      const userId = validateToken(token);
      if (!userId) {
        return errorResponse("Invalid token", 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
        return errorResponse("Access denied", 403);
      }

      // Get all memberships
      const memberships = await prisma.customerMembership.findMany();

      // Group by tier
      const byTier: Record<string, any> = {};
      const tiers = await prisma.membershipTier.findMany({
        orderBy: { tierOrder: "asc" },
      });

      tiers.forEach(tier => {
        const tierMembers = memberships.filter(m => m.currentTier === tier.tierLevel);
        const totalSpending = tierMembers.reduce((sum, m) => sum + m.totalSpending, 0);
        const avgSpending = tierMembers.length > 0 ? totalSpending / tierMembers.length : 0;
        const totalVisits = tierMembers.reduce((sum, m) => sum + m.totalVisits, 0);
        const avgVisits = tierMembers.length > 0 ? totalVisits / tierMembers.length : 0;

        byTier[tier.tierLevel] = {
          tierName: tier.tierName,
          memberCount: tierMembers.length,
          totalSpending,
          avgSpending,
          totalVisits,
          avgVisits,
          avgLTV: avgSpending, // Simplified
        };
      });

      // Get tier changes (last 30 days)
      const recentChanges = await prisma.tierUpgradeHistory.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const upgrades = recentChanges.filter(c => c.changeType === "UPGRADE").length;
      const downgrades = recentChanges.filter(c => c.changeType === "DOWNGRADE").length;

      // Calculate total metrics
      const totalMembers = memberships.length;
      const totalSpending = memberships.reduce((sum, m) => sum + m.totalSpending, 0);
      const totalPoints = memberships.reduce((sum, m) => sum + m.currentPoints, 0);

      return successResponse({
        overview: {
          totalMembers,
          totalSpending,
          totalPoints,
          avgSpending: totalMembers > 0 ? totalSpending / totalMembers : 0,
        },
        byTier,
        tierChanges: {
          upgrades,
          downgrades,
          recent: recentChanges.slice(0, 10),
        },
      });
    }

    return errorResponse("Invalid request", 400);
  } catch (error: any) {
    console.error("Error fetching dashboard:", error);
    return errorResponse(error.message || "Failed to fetch dashboard", 500);
  }
}

