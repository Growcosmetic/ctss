// ============================================
// Abandoned Cart - Recovery automation
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      phone,
      abandonmentType,
      originalIntent,
      metadata,
    } = await req.json();

    if (!abandonmentType) {
      return NextResponse.json(
        { error: "abandonmentType is required" },
        { status: 400 }
      );
    }

    if (!customerId && !phone) {
      return NextResponse.json(
        { error: "customerId or phone is required" },
        { status: 400 }
      );
    }

    const validTypes = [
      "INBOX_NO_BOOKING",
      "BOOKING_NO_ARRIVAL",
      "NO_CHECKOUT",
      "VIEWED_NO_ACTION",
    ];

    if (!validTypes.includes(abandonmentType)) {
      return NextResponse.json(
        { error: "Invalid abandonment type" },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await prisma.abandonedCart.findFirst({
      where: {
        OR: [
          { customerId: customerId || "none" },
          { phone: phone || "none" },
        ],
        abandonmentType,
        status: "ABANDONED",
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        abandoned: existing,
        message: "Already tracked",
      });
    }

    // Calculate next attempt based on type
    const nextAttempt = new Date();
    if (abandonmentType === "INBOX_NO_BOOKING") {
      nextAttempt.setDate(nextAttempt.getDate() + 1); // 1 day
    } else if (abandonmentType === "BOOKING_NO_ARRIVAL") {
      nextAttempt.setDate(nextAttempt.getDate() + 2); // 2 days
    } else if (abandonmentType === "NO_CHECKOUT") {
      nextAttempt.setHours(nextAttempt.getHours() + 6); // 6 hours
    } else {
      nextAttempt.setDate(nextAttempt.getDate() + 3); // 3 days
    }

    const abandoned = await prisma.abandonedCart.create({
      data: {
        customerId: customerId || null,
        phone: phone || null,
        abandonmentType,
        originalIntent: originalIntent || null,
        status: "ABANDONED",
        metadata: metadata || null,
        recoveryAttempts: 0,
        nextAttempt,
      },
    });

    return NextResponse.json({
      success: true,
      abandoned,
    });
  } catch (err: any) {
    console.error("Create abandoned cart error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create abandoned cart",
      },
      { status: 500 }
    );
  }
}

// Get abandoned carts for recovery
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ABANDONED";
    const due = searchParams.get("due") === "true"; // Get due for recovery

    const where: any = { status };
    if (due) {
      where.nextAttempt = {
        lte: new Date(),
      };
    }

    const abandoned = await prisma.abandonedCart.findMany({
      where,
      orderBy: { nextAttempt: "asc" },
    });

    return NextResponse.json({
      success: true,
      abandoned,
      total: abandoned.length,
    });
  } catch (err: any) {
    console.error("Get abandoned carts error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get abandoned carts",
      },
      { status: 500 }
    );
  }
}

// Update recovery attempt
export async function PATCH(req: Request) {
  try {
    const { id, status, recoveryAttempts } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // Calculate next attempt
    const nextAttempt = new Date();
    nextAttempt.setDate(nextAttempt.getDate() + 3); // Next attempt in 3 days

    const abandoned = await prisma.abandonedCart.update({
      where: { id },
      data: {
        status: status || undefined,
        recoveryAttempts: recoveryAttempts !== undefined ? recoveryAttempts + 1 : undefined,
        lastAttempt: new Date(),
        nextAttempt: status === "ABANDONED" ? nextAttempt : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      abandoned,
    });
  } catch (err: any) {
    console.error("Update abandoned cart error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update abandoned cart",
      },
      { status: 500 }
    );
  }
}

