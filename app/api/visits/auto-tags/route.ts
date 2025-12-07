// ============================================
// Visit - Auto Generate Tags (based on customer data)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { visitId } = await req.json();

    if (!visitId) {
      return NextResponse.json(
        { error: "visitId is required" },
        { status: 400 }
      );
    }

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        customer: {
          select: {
            id: true,
            totalVisits: true,
            totalSpent: true,
            riskLevel: true,
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: "Visit not found" },
        { status: 404 }
      );
    }

    const tags: string[] = [];

    // VIP: Chi tiêu > 8 triệu
    if (visit.customer.totalSpent > 8_000_000) {
      tags.push("VIP");
    }

    // Premium: Dùng nhiều technical service
    const technicalServices = ["Uốn", "Nhuộm", "Phục hồi"];
    if (technicalServices.some((s) => visit.service.includes(s))) {
      tags.push("Premium");
    }

    // Risky: Customer risk level HIGH hoặc visit có warnings
    if (
      visit.customer.riskLevel === "HIGH" ||
      (visit.technical &&
        typeof visit.technical === "object" &&
        "warnings" in visit.technical &&
        Array.isArray(visit.technical.warnings) &&
        visit.technical.warnings.length > 0)
    ) {
      tags.push("Risky");
    }

    // Get all visits to check loyalty
    const allVisits = await prisma.visit.findMany({
      where: { customerId: visit.customerId },
      orderBy: { date: "desc" },
      take: 10,
    });

    // Loyal: 3+ visits trong 6 tháng
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentVisits = allVisits.filter(
      (v) => new Date(v.date) >= sixMonthsAgo
    );
    if (recentVisits.length >= 3) {
      tags.push("Loyal");
    }

    // Overdue: 90 ngày chưa quay lại (cho visit gần nhất)
    if (allVisits.length > 0) {
      const latestVisit = allVisits[0];
      const daysSince = Math.floor(
        (Date.now() - new Date(latestVisit.date).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSince > 90) {
        tags.push("Overdue");
      }
    }

    // Update visit with tags
    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        tags: [...new Set(tags)], // Remove duplicates
      },
    });

    return NextResponse.json({
      success: true,
      visit: updatedVisit,
      tags,
    });
  } catch (err: any) {
    console.error("Auto tags error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate tags",
      },
      { status: 500 }
    );
  }
}

