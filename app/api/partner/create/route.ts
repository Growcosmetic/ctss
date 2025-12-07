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
    // In production, verify JWT token
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

// POST /api/partner/create
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

    // Only HQ (ADMIN with special permission) can create partners
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return errorResponse("Only HQ can create partners", 403);
    }

    const body = await request.json();
    const { 
      salonName, 
      ownerName, 
      phone, 
      email, 
      plan = "BASIC",
      licensePeriod = 1 // months
    } = body;

    if (!salonName) {
      return errorResponse("Salon name is required", 400);
    }

    // Create partner
    const partner = await prisma.partner.create({
      data: {
        salonName,
        ownerName,
        phone,
        email,
        plan,
        licenseStatus: "ACTIVE",
        licenseStartDate: new Date(),
        licenseEndDate: new Date(Date.now() + licensePeriod * 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create initial license
    const license = await prisma.license.create({
      data: {
        partnerId: partner.id,
        plan,
        price: getPlanPrice(plan),
        period: licensePeriod,
        startDate: new Date(),
        endDate: new Date(Date.now() + licensePeriod * 30 * 24 * 60 * 60 * 1000),
        nextPaymentDate: new Date(Date.now() + licensePeriod * 30 * 24 * 60 * 60 * 1000),
      },
    });

    return successResponse(
      { partner, license },
      "Partner created successfully",
      201
    );
  } catch (error: any) {
    console.error("Error creating partner:", error);
    return errorResponse(error.message || "Failed to create partner", 500);
  }
}

function getPlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    BASIC: 1500000,      // 1.5M VND/month
    PRO: 3500000,        // 3.5M VND/month
    ENTERPRISE: 6000000, // 6M VND/month
  };
  return prices[plan] || prices.BASIC;
}

