// ============================================
// Visit - Update Products Used (from Assistant/Phase 54)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { visitId, productsUsed, totalCharge } = await req.json();

    if (!visitId) {
      return NextResponse.json(
        { error: "visitId is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (productsUsed) {
      updateData.productsUsed = productsUsed;
    }
    if (totalCharge !== undefined) {
      updateData.totalCharge = totalCharge;
    }

    // Update visit
    const visit = await prisma.visit.update({
      where: { id: visitId },
      data: updateData,
    });

    // If totalCharge changed, update customer totalSpent
    if (totalCharge !== undefined) {
      const oldVisit = await prisma.visit.findUnique({
        where: { id: visitId },
        select: { totalCharge: true },
      });

      const oldCharge = oldVisit?.totalCharge || 0;
      const diff = totalCharge - oldCharge;

      if (diff !== 0) {
        await prisma.customer.update({
          where: { id: visit.customerId },
          data: {
            totalSpent: {
              increment: diff,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      visit,
    });
  } catch (err: any) {
    console.error("Update products error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update products",
      },
      { status: 500 }
    );
  }
}

