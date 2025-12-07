// ============================================
// Customer Risk Alert - Detect churn risk
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
        behavior: true,
        experiences: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        touchpoints: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate risk factors
    let riskScore = 0;
    const factors: string[] = [];
    let riskType = "LOW_ENGAGEMENT";
    let severity = "LOW";

    // Factor 1: Days since last visit
    if (customer.behavior?.lastVisit) {
      const daysSinceLastVisit =
        (new Date().getTime() - customer.behavior.lastVisit.getTime()) /
        (1000 * 60 * 60 * 24);

      if (daysSinceLastVisit > 90) {
        riskScore += 40;
        factors.push(`${Math.round(daysSinceLastVisit)} ngày không đến salon`);
        riskType = "CHURN";
        severity = "HIGH";
      } else if (daysSinceLastVisit > 60) {
        riskScore += 25;
        factors.push(`${Math.round(daysSinceLastVisit)} ngày không đến salon`);
        severity = "MEDIUM";
      }
    }

    // Factor 2: Experience scores
    if (customer.experiences.length > 0) {
      const avgScore =
        customer.experiences.reduce((sum, e) => sum + e.overallScore, 0) /
        customer.experiences.length;

      if (avgScore < 70) {
        riskScore += 30;
        factors.push(`Điểm trải nghiệm thấp: ${avgScore.toFixed(1)}/100`);
        riskType = "NEGATIVE_FEEDBACK";
        if (severity === "LOW") severity = "MEDIUM";
      } else if (avgScore < 80) {
        riskScore += 15;
        factors.push(`Điểm trải nghiệm trung bình: ${avgScore.toFixed(1)}/100`);
      }

      // Check for negative sentiment
      const negativeCount = customer.experiences.filter(
        (e) => e.sentiment === "NEGATIVE"
      ).length;
      if (negativeCount > 0) {
        riskScore += 20;
        factors.push(`${negativeCount} trải nghiệm tiêu cực`);
      }
    }

    // Factor 3: No response to follow-ups
    const followUpTouchpoints = customer.touchpoints.filter(
      (tp) => tp.type === "FOLLOW_UP"
    );
    const noResponseCount = followUpTouchpoints.filter(
      (tp) => tp.outcome === "NO_RESPONSE" || tp.outcome === "PENDING"
    ).length;

    if (noResponseCount >= 2) {
      riskScore += 25;
      factors.push(`Không phản hồi ${noResponseCount} tin nhắn chăm sóc`);
      riskType = "NO_RESPONSE";
      if (severity === "LOW") severity = "MEDIUM";
    }

    // Factor 4: Behavior type
    if (customer.behavior?.behaviorType === "CHURN_RISK") {
      riskScore += 30;
      factors.push("Được phân loại là CHURN_RISK");
      severity = "HIGH";
    }

    // Factor 5: Visit frequency drop
    if (customer.behavior?.visitFrequency) {
      const expectedVisits = (customer.behavior.visitFrequency * 3); // 3 months
      const actualVisits = customer.totalVisits || 0;
      if (actualVisits < expectedVisits * 0.5) {
        riskScore += 20;
        factors.push("Tần suất đến giảm mạnh");
      }
    }

    riskScore = Math.min(100, riskScore);

    // Determine severity
    if (riskScore >= 70) {
      severity = "CRITICAL";
      riskType = "CHURN";
    } else if (riskScore >= 50) {
      severity = "HIGH";
    } else if (riskScore >= 30) {
      severity = "MEDIUM";
    }

    // Calculate churn probability
    const churnProbability = Math.min(100, riskScore);
    
    // Predict churn date (if high risk)
    let predictedChurnDate: Date | null = null;
    if (churnProbability >= 60 && customer.behavior?.lastVisit) {
      predictedChurnDate = new Date(customer.behavior.lastVisit);
      predictedChurnDate.setDate(predictedChurnDate.getDate() + 90);
    }

    // Recommended actions
    let recommendedAction = "";
    if (severity === "CRITICAL") {
      recommendedAction = "Gửi voucher ưu đãi đặc biệt, gọi điện trực tiếp";
    } else if (severity === "HIGH") {
      recommendedAction = "Gửi voucher 10-15%, nhắn tin cá nhân hóa";
    } else if (severity === "MEDIUM") {
      recommendedAction = "Gửi tin nhắn chăm sóc, mời quay lại";
    } else {
      recommendedAction = "Theo dõi tiếp, gửi tin nhắn thường xuyên";
    }

    // Check if alert already exists
    const existing = await prisma.customerRiskAlert.findFirst({
      where: {
        customerId,
        status: "ACTIVE",
        riskType,
      },
    });

    if (existing && riskScore < 50) {
      // Update existing if risk is still moderate
      const alert = await prisma.customerRiskAlert.update({
        where: { id: existing.id },
        data: {
          riskScore,
          severity,
          factors: factors,
          churnProbability,
          predictedChurnDate,
          recommendedAction,
        },
      });

      return NextResponse.json({
        success: true,
        alert,
        isNew: false,
      });
    }

    // Create new alert if risk is high or no existing alert
    if (riskScore >= 30 || !existing) {
      const alert = await prisma.customerRiskAlert.create({
        data: {
          customerId,
          riskType,
          riskScore,
          severity,
          factors: factors,
          lastContact: customer.touchpoints[0]?.createdAt || null,
          daysSinceLastVisit: customer.behavior?.lastVisit
            ? Math.round(
                (new Date().getTime() -
                  customer.behavior.lastVisit.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
          lastScore:
            customer.experiences.length > 0
              ? customer.experiences[0].overallScore
              : null,
          churnProbability,
          predictedChurnDate,
          recommendedAction,
          status: "ACTIVE",
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        alert,
        isNew: true,
      });
    }

    return NextResponse.json({
      success: true,
      alert: null,
      riskScore,
      message: "Risk detected but below threshold",
    });
  } catch (err: any) {
    console.error("Detect risk error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to detect risk",
      },
      { status: 500 }
    );
  }
}

// Get risk alerts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status") || "ACTIVE";

    const where: any = { status };
    if (customerId) where.customerId = customerId;
    if (severity) where.severity = severity;

    const alerts = await prisma.customerRiskAlert.findMany({
      where,
      orderBy: [
        { severity: "desc" },
        { riskScore: "desc" },
        { detectedAt: "desc" },
      ],
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      alerts,
      total: alerts.length,
    });
  } catch (err: any) {
    console.error("Get risk alerts error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get risk alerts",
      },
      { status: 500 }
    );
  }
}

