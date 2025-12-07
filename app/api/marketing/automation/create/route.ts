// ============================================
// Marketing Automation - Create automation flow
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      campaignId,
      name,
      triggerType,
      segment,
      steps,
      startDate,
      endDate,
    } = await req.json();

    if (!name || !triggerType || !steps) {
      return NextResponse.json(
        { error: "name, triggerType, and steps are required" },
        { status: 400 }
      );
    }

    // Validate trigger type
    const validTriggers = [
      "NEW_CUSTOMER",
      "RISK_CUSTOMER",
      "VIP",
      "POST_SERVICE",
      "BIRTHDAY",
    ];

    if (!validTriggers.includes(triggerType)) {
      return NextResponse.json(
        { error: "Invalid trigger type" },
        { status: 400 }
      );
    }

    // Create automation
    const automation = await prisma.marketingAutomation.create({
      data: {
        campaignId: campaignId || null,
        name,
        triggerType,
        segment: segment || null,
        steps: steps, // Array of { day, action, content, channel }
        isActive: true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        campaign: {
          include: {
            channel: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      automation,
    });
  } catch (err: any) {
    console.error("Create automation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create automation",
      },
      { status: 500 }
    );
  }
}

// Get automations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const triggerType = searchParams.get("triggerType");
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (triggerType) where.triggerType = triggerType;
    if (isActive !== null) where.isActive = isActive === "true";

    const automations = await prisma.marketingAutomation.findMany({
      where,
      include: {
        campaign: {
          include: {
            channel: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      automations,
      total: automations.length,
    });
  } catch (err: any) {
    console.error("Get automations error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get automations",
      },
      { status: 500 }
    );
  }
}

