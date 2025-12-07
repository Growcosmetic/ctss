// ============================================
// CRM Segmentation - List Customers by Segment/Tag
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { segment, tag, category } = await req.json();

    let where: any = {};

    if (tag) {
      // Find customers with specific tag
      where.tags = {
        some: {
          tag,
        },
      };
    } else if (category) {
      // Find customers with tags in category
      where.tags = {
        some: {
          category,
        },
      };
    }

    // Get customers
    const customers = await prisma.customer.findMany({
      where,
      include: {
        tags: true,
        visits: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
      take: 200,
    });

    // If segment provided, filter by segmentation logic
    let filtered = customers;
    if (segment) {
      // Apply segmentation filter
      // This is a simplified version - full logic in tagRules.ts
      filtered = customers.filter((c) => {
        const tags = c.tags.map((t) => t.tag);
        // Group A: VIP High Value
        if (segment === "A") {
          return (
            tags.includes("VIP") &&
            (tags.includes("High Value") || tags.includes("Active"))
          );
        }
        // Group B: Ready-to-Return
        if (segment === "B") {
          return (
            tags.includes("Warm") ||
            tags.includes("Cold") ||
            tags.includes("Active")
          );
        }
        // Group C: Overdue
        if (segment === "C") {
          return tags.includes("Overdue");
        }
        // Group D: Lost
        if (segment === "D") {
          return tags.includes("Lost");
        }
        // Group E: High Risk
        if (segment === "E") {
          return (
            tags.includes("Risky Hair") ||
            tags.includes("High-Damage History")
          );
        }
        // Group F: Color Lovers
        if (segment === "F") {
          return tags.some((t) => t.includes("màu") || t.includes("nhuộm"));
        }
        // Group G: Curl Lovers
        if (segment === "G") {
          return tags.includes("Hay uốn");
        }
        return false;
      });
    }

    return NextResponse.json({
      success: true,
      customers: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    console.error("List segmentation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to list segmentation",
      },
      { status: 500 }
    );
  }
}

