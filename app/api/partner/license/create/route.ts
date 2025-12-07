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

// POST /api/partner/license/create
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

    // Only HQ or Partner Owner can create licenses
    if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
      return errorResponse("Access denied", 403);
    }

    const body = await request.json();
    const { 
      partnerId, 
      plan, 
      period = 1, // months
      autoRenew = true 
    } = body;

    if (!partnerId || !plan) {
      return errorResponse("Partner ID and plan are required", 400);
    }

    // Validate partner exists
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return errorResponse("Partner not found", 404);
    }

    // Check if partner owner
    if (user.role !== "ADMIN" && user.partnerId !== partnerId) {
      return errorResponse("Access denied", 403);
    }

    const price = getPlanPrice(plan);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + period);

    // Create license
    const license = await prisma.license.create({
      data: {
        partnerId,
        plan,
        price,
        period,
        startDate,
        endDate,
        autoRenew,
        status: "ACTIVE",
        paymentStatus: "PENDING",
        nextPaymentDate: endDate,
      },
    });

    // Update partner license status
    await prisma.partner.update({
      where: { id: partnerId },
      data: {
        plan,
        licenseStatus: "ACTIVE",
        licenseStartDate: startDate,
        licenseEndDate: endDate,
      },
    });

    return successResponse(license, "License created successfully", 201);
  } catch (error: any) {
    console.error("Error creating license:", error);
    return errorResponse(error.message || "Failed to create license", 500);
  }
}

function getPlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    BASIC: 1500000,
    PRO: 3500000,
    ENTERPRISE: 6000000,
  };
  return prices[plan] || prices.BASIC;
}

