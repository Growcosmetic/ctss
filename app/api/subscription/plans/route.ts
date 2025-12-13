import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { PLAN_CONFIGS } from "@/lib/subscription/constants";
import { SubscriptionPlan } from "@prisma/client";

// GET /api/subscription/plans - List all available plans
export async function GET(request: NextRequest) {
  try {
    // Get plans from database (or create defaults if not exist)
    let plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    // If no plans exist, return default configs
    if (plans.length === 0) {
      plans = Object.keys(PLAN_CONFIGS).map((planName) => ({
        id: planName.toLowerCase(),
        name: planName as SubscriptionPlan,
        displayName: PLAN_CONFIGS[planName as SubscriptionPlan].displayName,
        description: null,
        price: PLAN_CONFIGS[planName as SubscriptionPlan].price,
        features: PLAN_CONFIGS[planName as SubscriptionPlan].features,
        limits: PLAN_CONFIGS[planName as SubscriptionPlan].limits,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as any;
    }

    return successResponse({ plans });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get plans", 500);
  }
}

