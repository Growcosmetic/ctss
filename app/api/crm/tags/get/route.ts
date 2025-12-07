// ============================================
// CRM Tags - Get Customer Tags
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

    const tags = await prisma.customerTag.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    // Group by category
    const grouped = tags.reduce(
      (acc: any, tag) => {
        const category = tag.category || "other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(tag);
        return acc;
      },
      {} as Record<string, typeof tags>
    );

    return NextResponse.json({
      success: true,
      tags,
      grouped,
      total: tags.length,
    });
  } catch (err: any) {
    console.error("Get tags error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get tags",
      },
      { status: 500 }
    );
  }
}

