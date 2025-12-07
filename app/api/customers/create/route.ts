// ============================================
// Customer Master Record - Create Customer
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      name,
      phone,
      birthday,
      gender,
      avatar,
      notes,
      riskLevel,
      preferredStylist,
    } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "name and phone are required" },
        { status: 400 }
      );
    }

    // Check if customer with phone already exists
    const existing = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Customer with this phone already exists" },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        birthday: birthday ? new Date(birthday) : null,
        gender: gender || null,
        avatar: avatar || null,
        notes: notes || null,
        riskLevel: riskLevel || null,
        preferredStylist: preferredStylist || null,
        totalSpent: 0,
        totalVisits: 0,
      },
    });

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (err: any) {
    console.error("Create customer error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create customer",
      },
      { status: 500 }
    );
  }
}

