// ============================================
// Customer Lifetime Value - Calculate CLV
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

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        invoices: {
          include: {
            items: {
              include: {
                service: true,
              },
            },
          },
        },
        bookings: true,
        loyalty: true,
        // referrals: true, // If referral system exists
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate total revenue
    const totalRevenue = customer.totalSpent || 0;

    // Estimate product cost (assume 10-15% of revenue)
    const productCost = totalRevenue * 0.12; // 12% average

    // Calculate profit
    const profit = totalRevenue - productCost;

    // Calculate referral value (if referrals exist)
    let referralValue = 0;
    // TODO: Calculate based on referral system

    // Calculate customer lifetime value
    const lifetimeValue = profit + referralValue;

    // Predict future value
    const behavior = await prisma.customerBehavior.findUnique({
      where: { customerId },
    });

    let predictedValue = lifetimeValue;
    if (behavior) {
      // Predict based on average spend and expected visits
      const monthsActive =
        customer.createdAt && customer.bookings[0]
          ? (new Date().getTime() - customer.createdAt.getTime()) /
            (1000 * 60 * 60 * 24 * 30)
          : 1;

      const avgMonthlyValue = lifetimeValue / Math.max(1, monthsActive);
      const expectedMonths = 12; // Assume customer stays 12 more months
      const expectedFutureValue = avgMonthlyValue * expectedMonths;

      // Apply retention probability
      const retentionProbability = behavior.behaviorType === "VIP" ? 0.9 :
                                   behavior.behaviorType === "HIGH_VALUE" ? 0.75 :
                                   behavior.behaviorType === "CHURN_RISK" ? 0.3 : 0.6;

      predictedValue = lifetimeValue + (expectedFutureValue * retentionProbability);
    }

    // Categorize customer
    let category = "REGULAR";
    if (lifetimeValue >= 10000000) {
      category = "VIP";
    } else if (lifetimeValue >= 5000000) {
      category = "GOLD";
    } else if (lifetimeValue >= 2000000) {
      category = "SILVER";
    }

    // Update behavior with CLV
    if (behavior) {
      await prisma.customerBehavior.update({
        where: { customerId },
        data: {
          lifetimeValue,
          predictedValue: Math.round(predictedValue * 100) / 100,
        },
      });
    }

    return NextResponse.json({
      success: true,
      lifetimeValue: {
        totalRevenue,
        productCost,
        profit,
        referralValue,
        lifetimeValue: Math.round(lifetimeValue * 100) / 100,
        predictedValue: Math.round(predictedValue * 100) / 100,
        category,
        visitCount: customer.totalVisits || customer.bookings.length,
        averageSpend: customer.totalVisits > 0 
          ? totalRevenue / customer.totalVisits 
          : 0,
      },
    });
  } catch (err: any) {
    console.error("Calculate CLV error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to calculate lifetime value",
      },
      { status: 500 }
    );
  }
}

// Get CLV for customer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    const behavior = await prisma.customerBehavior.findUnique({
      where: { customerId },
      select: {
        lifetimeValue: true,
        predictedValue: true,
        totalSpent: true,
        visitCount: true,
        averageSpend: true,
      },
    });

    if (!behavior) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer behavior not analyzed yet",
        },
        { status: 404 }
      );
    }

    // Calculate category
    let category = "REGULAR";
    if (behavior.lifetimeValue >= 10000000) {
      category = "VIP";
    } else if (behavior.lifetimeValue >= 5000000) {
      category = "GOLD";
    } else if (behavior.lifetimeValue >= 2000000) {
      category = "SILVER";
    }

    return NextResponse.json({
      success: true,
      lifetimeValue: {
        lifetimeValue: behavior.lifetimeValue,
        predictedValue: behavior.predictedValue,
        category,
        totalSpent: behavior.totalSpent,
        visitCount: behavior.visitCount,
        averageSpend: behavior.averageSpend,
      },
    });
  } catch (err: any) {
    console.error("Get CLV error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get lifetime value",
      },
      { status: 500 }
    );
  }
}

