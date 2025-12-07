// ============================================
// CRM Tags - Refresh Customer Tags
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTags, getSegmentationGroup } from "@/core/crm/tagRules";

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        totalVisits: true,
        totalSpent: true,
        riskLevel: true,
        preferredStylist: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get visits
    const visits = await prisma.visit.findMany({
      where: { customerId },
      orderBy: { date: "desc" },
    });

    // Generate tags
    const generatedTags = generateTags(customer, visits);

    // Delete old tags
    await prisma.customerTag.deleteMany({
      where: { customerId },
    });

    // Create new tags
    if (generatedTags.length > 0) {
      await prisma.customerTag.createMany({
        data: generatedTags.map((t) => ({
          customerId,
          tag: t.tag,
          category: t.category || null,
        })),
      });
    }

    // Get segmentation group
    const segment = getSegmentationGroup(generatedTags);

    // Update customer preferredStylist if detected
    const preferredTag = generatedTags.find((t) =>
      t.tag.startsWith("Preferred:")
    );
    if (preferredTag && !customer.preferredStylist) {
      const stylistName = preferredTag.tag.replace("Preferred: ", "");
      await prisma.customer.update({
        where: { id: customerId },
        data: { preferredStylist: stylistName },
      });
    }

    return NextResponse.json({
      success: true,
      tags: generatedTags,
      segment,
      total: generatedTags.length,
    });
  } catch (err: any) {
    console.error("Refresh tags error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to refresh tags",
      },
      { status: 500 }
    );
  }
}

