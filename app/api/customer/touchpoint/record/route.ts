// ============================================
// Customer Touchpoint - Record touchpoint
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      type,
      channel,
      responseTime,
      content,
      outcome,
      metadata,
      staffId,
    } = await req.json();

    if (!customerId || !type) {
      return NextResponse.json(
        { error: "customerId and type are required" },
        { status: 400 }
      );
    }

    // Validate touchpoint type
    const validTypes = [
      "INBOX",
      "CALL",
      "BOOKING",
      "SERVICE",
      "CHECKOUT",
      "FOLLOW_UP",
      "REVIEW",
      "REFERRAL",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid touchpoint type" },
        { status: 400 }
      );
    }

    // Create touchpoint
    const touchpoint = await prisma.customerTouchpoint.create({
      data: {
        customerId,
        type,
        channel: channel || null,
        responseTime: responseTime || null,
        content: content || null,
        outcome: outcome || "PENDING",
        metadata: metadata || null,
        staffId: staffId || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Auto-track journey if applicable
    let journeyStage: string | null = null;
    if (type === "INBOX" || type === "CALL") {
      journeyStage = "CONSIDERATION";
    } else if (type === "BOOKING") {
      journeyStage = "BOOKING";
    } else if (type === "SERVICE") {
      journeyStage = "SERVICE";
    } else if (type === "CHECKOUT") {
      journeyStage = "CHECKOUT";
    } else if (type === "FOLLOW_UP") {
      journeyStage = "POST_SERVICE";
    } else if (type === "REVIEW" || type === "REFERRAL") {
      journeyStage = "RETURN";
    }

    if (journeyStage) {
      await prisma.customerJourney.create({
        data: {
          customerId,
          journeyStage,
          touchpoint: type,
          touchpointData: {
            touchpointId: touchpoint.id,
            channel,
            outcome,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      touchpoint,
    });
  } catch (err: any) {
    console.error("Record touchpoint error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to record touchpoint",
      },
      { status: 500 }
    );
  }
}

// Get touchpoints for customer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (type) where.type = type;

    const touchpoints = await prisma.customerTouchpoint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      total: touchpoints.length,
      byType: {} as Record<string, number>,
      byChannel: {} as Record<string, number>,
      byOutcome: {} as Record<string, number>,
      averageResponseTime: 0,
    };

    let totalResponseTime = 0;
    let responseTimeCount = 0;

    for (const tp of touchpoints) {
      stats.byType[tp.type] = (stats.byType[tp.type] || 0) + 1;
      if (tp.channel) {
        if (tp.channel) {
          stats.byChannel[tp.channel] = (stats.byChannel[tp.channel] || 0) + 1;
        }
      }
      if (tp.outcome) {
        stats.byOutcome[tp.outcome] = (stats.byOutcome[tp.outcome] || 0) + 1;
      }
      if (tp.responseTime) {
        totalResponseTime += tp.responseTime;
        responseTimeCount++;
      }
    }

    stats.averageResponseTime =
      responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

    return NextResponse.json({
      success: true,
      touchpoints,
      stats,
    });
  } catch (err: any) {
    console.error("Get touchpoints error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get touchpoints",
      },
      { status: 500 }
    );
  }
}

