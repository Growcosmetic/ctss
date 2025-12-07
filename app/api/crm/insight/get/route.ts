// ============================================
// CRM Insight - Get Customer Insight
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    const insight = await prisma.customerInsight.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    if (!insight) {
      return NextResponse.json({
        success: true,
        insight: null,
        message: "No insight found. Generate one first.",
      });
    }

    return NextResponse.json({
      success: true,
      insight,
    });
  } catch (err: any) {
    console.error("Get insight error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get insight",
      },
      { status: 500 }
    );
  }
}

