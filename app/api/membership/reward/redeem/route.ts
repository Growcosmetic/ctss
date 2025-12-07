// ============================================
// PHASE 34E - Reward Redemption
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/membership/reward/redeem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      rewardId,
      bookingId,
      serviceId,
    } = body;

    if (!customerId || !rewardId) {
      return errorResponse("Customer ID and reward ID are required", 400);
    }

    // Get membership
    const membership = await prisma.customerMembership.findUnique({
      where: { customerId },
    });

    if (!membership) {
      return errorResponse("Membership not found", 404);
    }

    // Get reward
    const reward = await prisma.rewardCatalog.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return errorResponse("Reward not found", 404);
    }

    // Check if reward is active
    if (!reward.isActive) {
      return errorResponse("Reward is not active", 400);
    }

    // Check date validity
    const now = new Date();
    if (reward.startDate && now < reward.startDate) {
      return errorResponse("Reward not yet available", 400);
    }
    if (reward.endDate && now > reward.endDate) {
      return errorResponse("Reward has expired", 400);
    }

    // Check tier eligibility
    if (reward.eligibleTiers.length > 0 && !reward.eligibleTiers.includes(membership.currentTier)) {
      return errorResponse(`Reward not available for ${membership.currentTier} tier`, 400);
    }

    // Check if customer has enough points
    if (membership.currentPoints < reward.pointsRequired) {
      return errorResponse(
        `Insufficient points. Required: ${reward.pointsRequired}, Available: ${membership.currentPoints}`,
        400
      );
    }

    // Check max redemptions per customer
    if (reward.maxRedemptions) {
      const customerRedemptions = await prisma.rewardRedemption.count({
        where: {
          customerId,
          rewardId,
          status: { not: "CANCELLED" },
        },
      });

      if (customerRedemptions >= reward.maxRedemptions) {
        return errorResponse("Max redemptions reached for this reward", 400);
      }
    }

    // Check max total redemptions
    if (reward.maxTotal && reward.currentRedemptions >= reward.maxTotal) {
      return errorResponse("Reward is sold out", 400);
    }

    // Deduct points
    const updatedMembership = await prisma.customerMembership.update({
      where: { id: membership.id },
      data: {
        currentPoints: { decrement: reward.pointsRequired },
        pointsRedeemed: { increment: reward.pointsRequired },
      },
    });

    // Create points transaction
    await prisma.pointsTransaction.create({
      data: {
        customerId,
        membershipId: membership.id,
        transactionType: "REDEEMED",
        points: -reward.pointsRequired,
        source: "REDEMPTION",
        sourceId: rewardId,
        description: `Redeemed ${reward.rewardName} for ${reward.pointsRequired} points`,
      },
    });

    // Create redemption record
    const redemption = await prisma.rewardRedemption.create({
      data: {
        customerId,
        membershipId: membership.id,
        rewardId,
        pointsUsed: reward.pointsRequired,
        status: "PENDING",
        bookingId: bookingId || null,
        serviceId: serviceId || null,
        expiresAt: reward.rewardType === "VOUCHER" || reward.rewardType === "DISCOUNT"
          ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
          : null,
      },
    });

    // Update reward current redemptions
    await prisma.rewardCatalog.update({
      where: { id: rewardId },
      data: {
        currentRedemptions: { increment: 1 },
      },
    });

    return successResponse({
      redemption,
      remainingPoints: updatedMembership.currentPoints,
    }, "Reward redeemed successfully", 201);
  } catch (error: any) {
    console.error("Error redeeming reward:", error);
    return errorResponse(error.message || "Failed to redeem reward", 500);
  }
}

// GET /api/membership/reward
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const tier = searchParams.get("tier");

    const where: any = { isActive: true };
    if (tier) {
      where.OR = [
        { eligibleTiers: { has: tier } },
        { eligibleTiers: { isEmpty: true } },
      ];
    }

    const rewards = await prisma.rewardCatalog.findMany({
      where,
      orderBy: { pointsRequired: "asc" },
    });

    // If customer ID provided, show their redemption history
    let redemptions = [];
    if (customerId) {
      redemptions = await prisma.rewardRedemption.findMany({
        where: { customerId },
        include: { reward: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    return successResponse({
      rewards,
      ...(customerId ? { redemptions } : {}),
    });
  } catch (error: any) {
    console.error("Error fetching rewards:", error);
    return errorResponse(error.message || "Failed to fetch rewards", 500);
  }
}

