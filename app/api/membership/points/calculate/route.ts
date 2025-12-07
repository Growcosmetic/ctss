// ============================================
// PHASE 34B - Point System
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/membership/points/calculate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      amount, // Amount spent in VND
      source, // SERVICE | PRODUCT | BONUS
      sourceId, // ID of service/product
      bookingId,
      invoiceId,
    } = body;

    if (!customerId || !amount) {
      return errorResponse("Customer ID and amount are required", 400);
    }

    // Get or create membership
    let membership = await prisma.customerMembership.findUnique({
      where: { customerId },
    });

    if (!membership) {
      // Create membership for new customer
      membership = await prisma.customerMembership.create({
        data: {
          customerId,
          currentTier: "MEMBER",
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });
    }

    // Get tier to get point multiplier
    const tier = await prisma.membershipTier.findUnique({
      where: { tierLevel: membership.currentTier },
    });

    const multiplier = tier?.pointMultiplier || 1.0;

    // Calculate points: 1,000 VND = 1 point
    const basePoints = amount / 1000;
    const calculatedPoints = basePoints * multiplier;

    // Update membership spending and points
    membership = await prisma.customerMembership.update({
      where: { id: membership.id },
      data: {
        totalSpending: { increment: amount },
        periodSpending: { increment: amount },
        currentPoints: { increment: calculatedPoints },
        lifetimePoints: { increment: calculatedPoints },
        lastVisitAt: new Date(),
        totalVisits: { increment: 1 },
        periodVisits: { increment: 1 },
      },
    });

    // Create points transaction
    const transaction = await prisma.pointsTransaction.create({
      data: {
        customerId,
        membershipId: membership.id,
        transactionType: "EARNED",
        points: calculatedPoints,
        source: source || "SERVICE",
        sourceId: sourceId || null,
        baseAmount: amount,
        multiplier,
        calculatedPoints: basePoints,
        description: `Earned ${calculatedPoints.toFixed(0)} points from ${source || "service"}`,
      },
    });

    return successResponse({
      points: calculatedPoints,
      totalPoints: membership.currentPoints,
      multiplier,
      transaction,
    });
  } catch (error: any) {
    console.error("Error calculating points:", error);
    return errorResponse(error.message || "Failed to calculate points", 500);
  }
}

// GET /api/membership/points?customerId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    const membership = await prisma.customerMembership.findUnique({
      where: { customerId },
    });

    if (!membership) {
      return successResponse({
        currentPoints: 0,
        lifetimePoints: 0,
        currentTier: "MEMBER",
      });
    }

    // Get recent transactions
    const transactions = await prisma.pointsTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return successResponse({
      currentPoints: membership.currentPoints,
      lifetimePoints: membership.lifetimePoints,
      pointsRedeemed: membership.pointsRedeemed,
      currentTier: membership.currentTier,
      transactions,
    });
  } catch (error: any) {
    console.error("Error fetching points:", error);
    return errorResponse(error.message || "Failed to fetch points", 500);
  }
}

