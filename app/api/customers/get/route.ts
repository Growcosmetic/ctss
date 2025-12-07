// ============================================
// Customer Master Record - Get Customer
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone, id } = await req.json();

    if (!phone && !id) {
      return NextResponse.json(
        { error: "phone or id is required" },
        { status: 400 }
      );
    }

    const where: any = {};
    if (id) {
      where.id = id;
    } else {
      where.phone = phone;
    }

    const customer = await prisma.customer.findUnique({
      where,
      include: {
        visits: {
          orderBy: { date: "desc" },
          take: 50, // Limit to latest 50 visits
        },
        invoices: {
          orderBy: { date: "desc" },
          take: 20,
        },
        loyalty: {
          include: {
            tier: true,
          },
        },
        profile: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (err: any) {
    console.error("Get customer error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get customer",
      },
      { status: 500 }
    );
  }
}

