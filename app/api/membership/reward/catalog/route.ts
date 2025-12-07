// ============================================
// Reward Catalog Management
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

// POST /api/membership/reward/catalog - Create reward
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const {
      rewardName,
      rewardType, // SERVICE | PRODUCT | DISCOUNT | VOUCHER | GIFT
      rewardValue,
      pointsRequired,
      eligibleTiers = [],
      description,
      imageUrl,
      maxRedemptions,
      maxTotal,
      startDate,
      endDate,
    } = body;

    if (!rewardName || !rewardType || !pointsRequired) {
      return errorResponse("Reward name, type, and points required are required", 400);
    }

    const reward = await prisma.rewardCatalog.create({
      data: {
        rewardName,
        rewardType,
        rewardValue: rewardValue ? parseFloat(rewardValue) : null,
        pointsRequired: parseFloat(pointsRequired),
        eligibleTiers: eligibleTiers || [],
        description: description || null,
        imageUrl: imageUrl || null,
        maxRedemptions: maxRedemptions || null,
        maxTotal: maxTotal || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    });

    return successResponse(reward, "Reward created", 201);
  } catch (error: any) {
    console.error("Error creating reward:", error);
    return errorResponse(error.message || "Failed to create reward", 500);
  }
}

// GET /api/membership/reward/catalog
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const rewardType = searchParams.get("rewardType");

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === "true";
    if (rewardType) where.rewardType = rewardType;

    const rewards = await prisma.rewardCatalog.findMany({
      where,
      orderBy: { pointsRequired: "asc" },
    });

    return successResponse(rewards);
  } catch (error: any) {
    console.error("Error fetching rewards:", error);
    return errorResponse(error.message || "Failed to fetch rewards", 500);
  }
}

