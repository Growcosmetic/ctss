// ============================================
// Sales Upsale - Record upsale transaction
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      invoiceId,
      customerId,
      staffId,
      originalAmount,
      upsaleAmount,
      originalItems,
      upsaleItems,
      source,
      recommendationId,
      conversionType,
    } = await req.json();

    if (!invoiceId || !customerId || !originalAmount) {
      return NextResponse.json(
        { error: "invoiceId, customerId, and originalAmount are required" },
        { status: 400 }
      );
    }

    const totalAmount = originalAmount + (upsaleAmount || 0);
    const upsaleRate =
      originalAmount > 0 ? ((upsaleAmount || 0) / originalAmount) * 100 : 0;

    const record = await prisma.upsaleRecord.create({
      data: {
        invoiceId,
        customerId,
        staffId: staffId || null,
        originalAmount,
        upsaleAmount: upsaleAmount || 0,
        totalAmount,
        originalItems: originalItems || [],
        upsaleItems: upsaleItems || [],
        source: source || "MANUAL",
        recommendationId: recommendationId || null,
        upsaleRate: Math.round(upsaleRate * 100) / 100,
        conversionType: conversionType || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Update recommendation status if exists
    if (recommendationId) {
      await prisma.upsaleRecommendation.update({
        where: { id: recommendationId },
        data: {
          status: "SOLD",
          acceptedItems: upsaleItems || [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (err: any) {
    console.error("Record upsale error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to record upsale",
      },
      { status: 500 }
    );
  }
}

// Get upsale records
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const staffId = searchParams.get("staffId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (staffId) where.staffId = staffId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const records = await prisma.upsaleRecord.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const stats = {
      totalRecords: records.length,
      totalOriginalAmount: records.reduce((sum, r) => sum + r.originalAmount, 0),
      totalUpsaleAmount: records.reduce((sum, r) => sum + r.upsaleAmount, 0),
      totalAmount: records.reduce((sum, r) => sum + r.totalAmount, 0),
      averageUpsaleRate:
        records.length > 0
          ? records.reduce((sum, r) => sum + (r.upsaleRate || 0), 0) /
            records.length
          : 0,
    };

    return NextResponse.json({
      success: true,
      records,
      stats,
    });
  } catch (err: any) {
    console.error("Get upsale records error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get upsale records",
      },
      { status: 500 }
    );
  }
}

