// ============================================
// PHASE 32B - Expense Management
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

// POST /api/financial/expense/create
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
      category, // PRODUCT | STAFF | UTILITY | RENT | MARKETING | TRAINING | DEPRECIATION | OPERATION | TOOLS_SUPPLIES
      subCategory,
      description,
      branchId,
      partnerId,
      paymentMethod,
      vendor,
      receiptUrl,
      invoiceNumber,
      isRecurring,
      recurringPeriod,
    } = body;

    if (!amount || !category || !description) {
      return errorResponse("Amount, category, and description are required", 400);
    }

    // Create expense record
    const expense = await prisma.expense.create({
      data: {
        date: date ? new Date(date) : new Date(),
        amount: parseFloat(amount),
        category,
        subCategory: subCategory || null,
        description,
        branchId: branchId || user.branchId || null,
        partnerId: partnerId || user.partnerId || null,
        paymentMethod: paymentMethod || null,
        vendor: vendor || null,
        receiptUrl: receiptUrl || null,
        invoiceNumber: invoiceNumber || null,
        isRecurring: isRecurring || false,
        recurringPeriod: recurringPeriod || null,
        status: user.role === "ADMIN" ? "APPROVED" : "PENDING",
        ...(user.role === "ADMIN" ? { approvedBy: userId, approvedAt: new Date() } : {}),
      },
    });

    return successResponse(expense, "Expense recorded", 201);
  } catch (error: any) {
    console.error("Error creating expense:", error);
    return errorResponse(error.message || "Failed to create expense", 500);
  }
}

// GET /api/financial/expense
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchId = searchParams.get("branchId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (branchId) where.branchId = branchId;
    if (category) where.category = category;
    if (status) where.status = status;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      take: 1000,
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    return successResponse({
      expenses,
      total: totalExpenses,
      count: expenses.length,
      byCategory,
    });
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return errorResponse(error.message || "Failed to fetch expenses", 500);
  }
}

