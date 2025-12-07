// ============================================
// Follow-up History API
// Get follow-up history for a customer
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const phone = searchParams.get("phone");

    if (!customerId && !phone) {
      return NextResponse.json(
        { error: "customerId or phone is required" },
        { status: 400 }
      );
    }

    // Find customer
    let finalCustomerId = customerId;
    if (phone && !customerId) {
      const customer = await prisma.customer.findUnique({
        where: { phone },
        select: { id: true },
      });
      if (customer) {
        finalCustomerId = customer.id;
      }
    }

    if (!finalCustomerId) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get follow-up history
    const followUps = await prisma.followUpMessage.findMany({
      where: { customerId: finalCustomerId },
      orderBy: { scheduledFor: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      followUps,
    });
  } catch (error: any) {
    console.error("Follow-up history error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get follow-up history" },
      { status: 500 }
    );
  }
}

