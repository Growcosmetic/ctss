// ============================================
// PHASE 34A - Tier Structure Setup
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// Initialize default tiers
const DEFAULT_TIERS = [
  {
    tierLevel: "MEMBER",
    tierName: "Thành viên",
    tierOrder: 1,
    minSpending: 0,
    periodMonths: 12,
    pointMultiplier: 1.0,
    benefits: {
      serviceDiscount: 0,
      productDiscount: 0,
      pointsMultiplier: 1.0,
      priorityBooking: false,
      priorityStylist: false,
      birthdayGift: false,
      vipHotline: false,
      freeRetouch: false,
    },
  },
  {
    tierLevel: "SILVER",
    tierName: "Bạc",
    tierOrder: 2,
    minSpending: 3000000,
    periodMonths: 6,
    pointMultiplier: 1.2,
    benefits: {
      serviceDiscount: 5,
      productDiscount: 5,
      pointsMultiplier: 1.2,
      priorityBooking: true,
      priorityStylist: false,
      birthdayGift: false,
      vipHotline: false,
      freeRetouch: false,
    },
  },
  {
    tierLevel: "GOLD",
    tierName: "Vàng",
    tierOrder: 3,
    minSpending: 10000000,
    periodMonths: 12,
    pointMultiplier: 1.5,
    benefits: {
      serviceDiscount: 10,
      productDiscount: 10,
      pointsMultiplier: 1.5,
      priorityBooking: true,
      priorityStylist: true,
      birthdayGift: true,
      vipHotline: false,
      freeRetouch: false,
    },
  },
  {
    tierLevel: "DIAMOND",
    tierName: "Kim cương",
    tierOrder: 4,
    minSpending: 25000000,
    periodMonths: 12,
    pointMultiplier: 2.0,
    benefits: {
      serviceDiscount: 15,
      productDiscount: 15,
      pointsMultiplier: 2.0,
      priorityBooking: true,
      priorityStylist: true,
      birthdayGift: true,
      vipHotline: true,
      freeRetouch: true,
    },
  },
];

// POST /api/membership/tier/setup - Initialize default tiers
export async function POST(request: NextRequest) {
  try {
    // Check if tiers already exist
    const existingTiers = await prisma.membershipTier.findMany();
    if (existingTiers.length > 0) {
      return successResponse(existingTiers, "Tiers already exist");
    }

    // Create default tiers
    const createdTiers = await Promise.all(
      DEFAULT_TIERS.map(tier =>
        prisma.membershipTier.create({
          data: tier,
        })
      )
    );

    return successResponse(createdTiers, "Default tiers created", 201);
  } catch (error: any) {
    console.error("Error setting up tiers:", error);
    return errorResponse(error.message || "Failed to setup tiers", 500);
  }
}

// GET /api/membership/tier
export async function GET(request: NextRequest) {
  try {
    const tiers = await prisma.membershipTier.findMany({
      orderBy: { tierOrder: "asc" },
    });

    return successResponse(tiers);
  } catch (error: any) {
    console.error("Error fetching tiers:", error);
    return errorResponse(error.message || "Failed to fetch tiers", 500);
  }
}

