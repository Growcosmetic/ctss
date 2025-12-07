// ============================================
// Customer Profile API
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================
// GET - Get customer profile
// ============================================

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

    const profile = await prisma.customerProfile.findUnique({
      where: customerId
        ? { customerId }
        : phone
        ? { phone }
        : undefined,
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get profile" },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Update or create customer profile
// ============================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, phone, data } = body;

    if (!customerId && !phone) {
      return NextResponse.json(
        { error: "customerId or phone is required" },
        { status: 400 }
      );
    }

    // Get customer info if only phone provided
    let finalCustomerId = customerId;
    if (phone && !customerId) {
      const customer = await prisma.customer.findUnique({
        where: { phone },
        select: { id: true, name: true, journeyState: true },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      finalCustomerId = customer.id;

      // Merge customer data into profile
      if (!data.name && customer.name) {
        data.name = customer.name;
      }
      if (!data.journeyState && customer.journeyState) {
        data.journeyState = customer.journeyState;
      }
    }

    // Upsert profile
    const updated = await prisma.customerProfile.upsert({
      where: { customerId: finalCustomerId },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        customerId: finalCustomerId,
        phone: phone || null,
        name: data.name || null,
        journeyState: data.journeyState || "AWARENESS",
        ...data,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}
