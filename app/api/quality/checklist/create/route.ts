// ============================================
// Quality Control - Technical Checklist
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      serviceId,
      serviceName,
      bookingId,
      items,
      completedItems,
    } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    // Calculate completion
    const completed = completedItems || [];
    const allItemIds = items.map((item: any) => item.id || item.step);
    const pending = allItemIds.filter((id: string) => !completed.includes(id));

    const completionRate =
      allItemIds.length > 0 ? (completed.length / allItemIds.length) * 100 : 0;
    const isCompleted = completionRate === 100;

    // AI Verification (check for critical missing items)
    const aiWarnings: string[] = [];
    if (!isCompleted) {
      for (const item of items) {
        if (
          item.critical &&
          !completed.includes(item.id || item.step)
        ) {
          aiWarnings.push(`⚠ Bỏ sót bước quan trọng: ${item.name || item.step}`);
        }
      }
    }

    // Create or update checklist
    const existing = await prisma.technicalChecklist.findFirst({
      where: {
        bookingId: bookingId || undefined,
        serviceId: serviceId || undefined,
      },
    });

    let checklist;
    if (existing) {
      checklist = await prisma.technicalChecklist.update({
        where: { id: existing.id },
        data: {
          items,
          completedItems: completed,
          pendingItems: pending,
          completionRate: Math.round(completionRate * 100) / 100,
          isCompleted,
          aiVerified: isCompleted && aiWarnings.length === 0,
          aiWarnings,
        },
      });
    } else {
      checklist = await prisma.technicalChecklist.create({
        data: {
          serviceId: serviceId || null,
          serviceName: serviceName || null,
          bookingId: bookingId || null,
          items,
          completedItems: completed,
          pendingItems: pending,
          skippedItems: [],
          completionRate: Math.round(completionRate * 100) / 100,
          isCompleted,
          aiVerified: isCompleted && aiWarnings.length === 0,
          aiWarnings,
        },
      });
    }

    return NextResponse.json({
      success: true,
      checklist,
    });
  } catch (err: any) {
    console.error("Create checklist error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create checklist",
      },
      { status: 500 }
    );
  }
}

// Get checklists
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const serviceId = searchParams.get("serviceId");

    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (serviceId) where.serviceId = serviceId;

    const checklists = await prisma.technicalChecklist.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      checklists,
    });
  } catch (err: any) {
    console.error("Get checklists error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get checklists",
      },
      { status: 500 }
    );
  }
}

