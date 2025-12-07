// ============================================
// Customer Master Record - Update Customer
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id, data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.birthday !== undefined)
      updateData.birthday = data.birthday ? new Date(data.birthday) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.riskLevel !== undefined) updateData.riskLevel = data.riskLevel;
    if (data.preferredStylist !== undefined)
      updateData.preferredStylist = data.preferredStylist;
    if (data.totalSpent !== undefined) updateData.totalSpent = data.totalSpent;
    if (data.totalVisits !== undefined)
      updateData.totalVisits = data.totalVisits;

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (err: any) {
    console.error("Update customer error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update customer",
      },
      { status: 500 }
    );
  }
}

