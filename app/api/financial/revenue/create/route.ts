// ============================================
// PHASE 32A - Revenue Data Pipeline
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

// POST /api/financial/revenue/create
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

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const body = await request.json();
    const {
      date,
      amount,
      source, // SERVICE | PRODUCT | COMBO | UPSELL | TIPS | PARTNER_FEE | PREPAYMENT
      paymentMethod,
      branchId,
      partnerId,
      customerId,
      staffId,
      serviceId,
      invoiceId,
      bookingId,
      productId,
      description,
      notes,
      receiptUrl,
    } = body;

    if (!amount || !source) {
      return errorResponse("Amount and source are required", 400);
    }

    // Create revenue record
    const revenue = await prisma.revenue.create({
      data: {
        date: date ? new Date(date) : new Date(),
        amount: parseFloat(amount),
        source,
        paymentMethod: paymentMethod || null,
        branchId: branchId || user.branchId || null,
        partnerId: partnerId || user.partnerId || null,
        customerId: customerId || null,
        staffId: staffId || null,
        serviceId: serviceId || null,
        invoiceId: invoiceId || null,
        bookingId: bookingId || null,
        productId: productId || null,
        description: description || null,
        notes: notes || null,
        receiptUrl: receiptUrl || null,
      },
    });

    return successResponse(revenue, "Revenue recorded", 201);
  } catch (error: any) {
    console.error("Error creating revenue:", error);
    return errorResponse(error.message || "Failed to create revenue", 500);
  }
}

// GET /api/financial/revenue
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchId = searchParams.get("branchId");
    const partnerId = searchParams.get("partnerId");
    const source = searchParams.get("source");

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (branchId) where.branchId = branchId;
    if (partnerId) where.partnerId = partnerId;
    if (source) where.source = source;

    const revenues = await prisma.revenue.findMany({
      where,
      orderBy: { date: "desc" },
      take: 1000,
    });

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

    return successResponse({
      revenues,
      total: totalRevenue,
      count: revenues.length,
    });
  } catch (error: any) {
    console.error("Error fetching revenues:", error);
    return errorResponse(error.message || "Failed to fetch revenues", 500);
  }
}

