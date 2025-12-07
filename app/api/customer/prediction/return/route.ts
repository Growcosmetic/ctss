// ============================================
// Customer Prediction - Return prediction
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

    // Get customer behavior
    const behavior = await prisma.customerBehavior.findUnique({
      where: { customerId },
    });

    if (!behavior) {
      return NextResponse.json(
        { error: "Customer behavior not analyzed yet" },
        { status: 400 }
      );
    }

    // Get recent experiences
    const experiences = await prisma.customerExperience.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Calculate return probability
    let returnProbability = 70; // Base probability

    // Adjust based on visit frequency
    if (behavior.visitFrequency && behavior.visitFrequency > 2) {
      returnProbability += 15; // Frequent visitor
    } else if (behavior.visitFrequency && behavior.visitFrequency < 0.5) {
      returnProbability -= 20; // Rare visitor
    }

    // Adjust based on last visit
    if (behavior.lastVisit) {
      const daysSinceLastVisit =
        (new Date().getTime() - behavior.lastVisit.getTime()) /
        (1000 * 60 * 60 * 24);

      if (daysSinceLastVisit < 30) {
        returnProbability += 10; // Recent visit
      } else if (daysSinceLastVisit > 90) {
        returnProbability -= 25; // Long time no visit
      }
    }

    // Adjust based on experience scores
    if (experiences.length > 0) {
      const avgScore =
        experiences.reduce((sum, e) => sum + e.overallScore, 0) /
        experiences.length;
      if (avgScore >= 85) {
        returnProbability += 10;
      } else if (avgScore < 70) {
        returnProbability -= 15;
      }
    }

    // Adjust based on behavior type
    if (behavior.behaviorType === "VIP" || behavior.behaviorType === "HIGH_VALUE") {
      returnProbability += 10;
    } else if (behavior.behaviorType === "CHURN_RISK") {
      returnProbability -= 30;
    }

    returnProbability = Math.max(0, Math.min(100, returnProbability));

    // Predict return date
    let predictedReturnDate: Date | null = null;
    if (behavior.nextPredictedVisit) {
      predictedReturnDate = behavior.nextPredictedVisit;
    } else if (behavior.lastVisit && behavior.visitFrequency) {
      const daysUntilNext = 30 / behavior.visitFrequency;
      predictedReturnDate = new Date(behavior.lastVisit);
      predictedReturnDate.setDate(
        predictedReturnDate.getDate() + Math.round(daysUntilNext)
      );
    }

    // Predict next service
    let predictedService = behavior.favoriteService || null;

    // Predict spend (based on average)
    const predictedSpend = behavior.averageSpend || 0;

    // Upsert prediction
    const prediction = await prisma.customerPrediction.upsert({
      where: {
        customerId_predictionType: {
          customerId,
          predictionType: "RETURN",
        },
      },
      create: {
        customerId,
        predictionType: "RETURN",
        returnProbability: Math.round(returnProbability * 100) / 100,
        predictedReturnDate,
        predictedService,
        predictedSpend,
        confidence: behavior.confidence || 70,
        factors: {
          visitFrequency: behavior.visitFrequency,
          lastVisit: behavior.lastVisit,
          avgExperienceScore:
            experiences.length > 0
              ? experiences.reduce((sum, e) => sum + e.overallScore, 0) /
                experiences.length
              : null,
          behaviorType: behavior.behaviorType,
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      update: {
        returnProbability: Math.round(returnProbability * 100) / 100,
        predictedReturnDate,
        predictedService,
        predictedSpend,
        confidence: behavior.confidence || 70,
        factors: {
          visitFrequency: behavior.visitFrequency,
          lastVisit: behavior.lastVisit,
          avgExperienceScore:
            experiences.length > 0
              ? experiences.reduce((sum, e) => sum + e.overallScore, 0) /
                experiences.length
              : null,
          behaviorType: behavior.behaviorType,
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
      prediction,
    });
  } catch (err: any) {
    console.error("Predict return error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to predict return",
      },
      { status: 500 }
    );
  }
}

// Get predictions for customer
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

    const predictions = await prisma.customerPrediction.findMany({
      where: {
        customerId,
        expiresAt: {
          gte: new Date(), // Only active predictions
        },
      },
      orderBy: { createdAt: "desc" },
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
      predictions,
    });
  } catch (err: any) {
    console.error("Get predictions error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get predictions",
      },
      { status: 500 }
    );
  }
}

