// ============================================
// Visit Timeline - Get Visits by Customer
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

    const visits = await prisma.visit.findMany({
      where: { customerId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      success: true,
      visits,
      total: visits.length,
    });
  } catch (err: any) {
    console.error("Get visits error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get visits",
      },
      { status: 500 }
    );
  }
}

