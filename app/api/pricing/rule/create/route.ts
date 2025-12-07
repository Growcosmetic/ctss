// ============================================
// PHASE 33 - Pricing Rule Management
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

// POST /api/pricing/rule/create
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

    const body = await request.json();
    const {
      ruleType, // TIME_BASED | DEMAND_BASED | STYLIST_LEVEL | PEAK_HOUR | SEASONAL
      ruleName,
      priority = 0,
      conditions,
      adjustmentType, // PERCENTAGE | FIXED_AMOUNT
      adjustmentValue,
      adjustmentDirection, // INCREASE | DECREASE
      serviceIds = [],
      branchIds = [],
      stylistIds = [],
      startDate,
      endDate,
      description,
    } = body;

    if (!ruleType || !ruleName || !adjustmentType || !adjustmentValue || !adjustmentDirection) {
      return errorResponse("Required fields: ruleType, ruleName, adjustmentType, adjustmentValue, adjustmentDirection", 400);
    }

    // Create pricing rule
    const rule = await prisma.pricingRule.create({
      data: {
        ruleType,
        ruleName,
        priority,
        conditions: conditions || {},
        adjustmentType,
        adjustmentValue: parseFloat(adjustmentValue),
        adjustmentDirection,
        serviceIds: serviceIds || [],
        branchIds: branchIds || [],
        stylistIds: stylistIds || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
        createdBy: userId,
        isActive: true,
      },
    });

    return successResponse(rule, "Pricing rule created", 201);
  } catch (error: any) {
    console.error("Error creating pricing rule:", error);
    return errorResponse(error.message || "Failed to create pricing rule", 500);
  }
}

// GET /api/pricing/rule
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleType = searchParams.get("ruleType");
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (ruleType) where.ruleType = ruleType;
    if (isActive !== null) where.isActive = isActive === "true";

    const rules = await prisma.pricingRule.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return successResponse(rules);
  } catch (error: any) {
    console.error("Error fetching pricing rules:", error);
    return errorResponse(error.message || "Failed to fetch pricing rules", 500);
  }
}

