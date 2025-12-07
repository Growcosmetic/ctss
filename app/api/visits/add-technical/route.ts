// ============================================
// Visit - Add Technical Record (from Stylist Coach)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { visitId, technical } = await req.json();

    if (!visitId || !technical) {
      return NextResponse.json(
        { error: "visitId and technical are required" },
        { status: 400 }
      );
    }

    // Update visit with technical record
    const visit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        technical,
      },
    });

    // Update customer riskLevel if technical has high risk
    if (technical.hairCondition?.breakageRisk === "HIGH") {
      await prisma.customer.update({
        where: { id: visit.customerId },
        data: {
          riskLevel: "HIGH",
        },
      });
    }

    return NextResponse.json({
      success: true,
      visit,
    });
  } catch (err: any) {
    console.error("Add technical record error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to add technical record",
      },
      { status: 500 }
    );
  }
}

