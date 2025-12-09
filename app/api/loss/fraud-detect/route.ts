// ============================================
// Fraud Detection - Detect fraud patterns
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { fraudDetectionPrompt } from "@/core/prompts/fraudDetectionPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { mixLogId, staffId, productId, startDate, endDate } =
      await req.json();

    // Get context data
    const where: any = {};
    if (staffId) where.staffId = staffId;
    if (productId) where.productId = productId;
    if (mixLogId) where.id = mixLogId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get mix logs
    const mixLogs = await prisma.mixLog.findMany({
      where,
      include: {
        product: true,
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    if (mixLogs.length === 0) {
      return NextResponse.json({
        success: true,
        detected: false,
        reason: "No mix logs found",
      });
    }

    // Get stock logs for same period
    const stockWhere: any = {};
    if (productId) stockWhere.productId = productId;
    if (startDate || endDate) {
      stockWhere.createdAt = {};
      if (startDate) stockWhere.createdAt.gte = new Date(startDate);
      if (endDate) stockWhere.createdAt.lte = new Date(endDate);
    }

    const stockLogs = await prisma.stockLog.findMany({
      where: stockWhere,
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Calculate product usage statistics
    const productUsage: Record<
      string,
      {
        productId: string;
        productName: string;
        totalUsed: number;
        averageQty: number;
        count: number;
        staffUsage: Record<string, number>;
      }
    > = {};

    for (const log of mixLogs) {
      const key = log.productId;
      if (!productUsage[key]) {
        productUsage[key] = {
          productId: log.productId,
          productName: log.product.name,
          totalUsed: 0,
          averageQty: 0,
          count: 0,
          staffUsage: {},
        };
      }

      productUsage[key].totalUsed += log.actualQty;
      productUsage[key].count++;
      productUsage[key].staffUsage[log.staffId] =
        (productUsage[key].staffUsage[log.staffId] || 0) + log.actualQty;
    }

    // Calculate averages
    for (const key in productUsage) {
      productUsage[key].averageQty =
        productUsage[key].totalUsed / productUsage[key].count;
    }

    // Get staff behavior
    const staffBehavior: Record<
      string,
      {
        staffId: string;
        staffName: string;
        totalServices: number;
        averageUsage: number;
        products: Record<string, number>;
      }
    > = {};

    for (const log of mixLogs) {
      if (!staffBehavior[log.staffId]) {
        staffBehavior[log.staffId] = {
          staffId: log.staffId,
          staffName: log.staff.name,
          totalServices: 0,
          averageUsage: 0,
          products: {},
        };
      }

      staffBehavior[log.staffId].totalServices++;
      staffBehavior[log.staffId].products[log.productId] =
        (staffBehavior[log.staffId].products[log.productId] || 0) +
        log.actualQty;
    }

    // Calculate staff averages
    for (const staffId in staffBehavior) {
      const staff = staffBehavior[staffId];
      const totalQty = Object.values(staff.products).reduce(
        (sum, qty) => sum + qty,
        0
      );
      staff.averageUsage = totalQty / staff.totalServices;
    }

    // Check inventory mismatch
    const inventoryMismatch = await checkInventoryMismatch(
      productId,
      startDate,
      endDate
    );

    // Prepare data for AI
    const analysisData = {
      mixLogs: mixLogs.slice(0, 20).map((log) => ({
        id: log.id,
        product: log.product.name,
        expectedQty: log.expectedQty,
        actualQty: log.actualQty,
        staff: log.staff.name,
        createdAt: log.createdAt,
      })),
      stockLogs: stockLogs.slice(0, 20).map((log) => ({
        type: log.type,
        quantity: log.quantity,
        product: log.product.name,
        createdAt: log.createdAt,
      })),
      productUsage: Object.values(productUsage),
      staffBehavior: Object.values(staffBehavior),
      inventoryMismatch,
    };

    // AI Fraud Detection
    const prompt = fraudDetectionPrompt(analysisData);

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI Fraud Detection System chuyên nghiệp. Phân tích dữ liệu, phát hiện gian lận với bằng chứng cụ thể. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      throw new Error("AI did not return fraud analysis");
    }

    let fraudAnalysis;
    try {
      fraudAnalysis = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fraudAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI fraud analysis");
      }
    }

    // Create alert if fraud detected
    if (
      fraudAnalysis.fraudPattern !== "NONE" &&
      fraudAnalysis.fraudScore >= 50
    ) {
      const severity =
        fraudAnalysis.fraudScore >= 80
          ? "CRITICAL"
          : fraudAnalysis.fraudScore >= 60
          ? "ALERT"
          : "WARNING";

      const alert = await prisma.lossAlert.create({
        data: {
          type: "FRAUD",
          severity,
          productId: productId || null,
          staffId: staffId || null,
          mixLogId: mixLogId || null,
          fraudPattern: fraudAnalysis.fraudPattern,
          fraudScore: Math.round(fraudAnalysis.fraudScore),
          behavior: JSON.stringify(fraudAnalysis.behavior),
          description: fraudAnalysis.evidence?.join(". ") || "",
          recommendation: fraudAnalysis.recommendation || "",
          status: "OPEN",
        },
        include: {
          product: true,
          staff: true,
        },
      });

      return NextResponse.json({
        success: true,
        detected: true,
        fraud: fraudAnalysis,
        alert: {
          id: alert.id,
          severity: alert.severity,
          fraudPattern: alert.fraudPattern,
          fraudScore: alert.fraudScore,
        },
      });
    }

    return NextResponse.json({
      success: true,
      detected: false,
      fraud: fraudAnalysis,
    });
  } catch (err: any) {
    console.error("Fraud detection error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to detect fraud",
      },
      { status: 500 }
    );
  }
}

async function checkInventoryMismatch(
  productId?: string,
  startDate?: string,
  endDate?: string
) {
  // Compare stock logs (OUT) vs mix logs usage
  // This is a simplified version - in production, you'd need actual inventory counts

  const where: any = {};
  if (productId) where.productId = productId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const stockOut = await prisma.stockLog.aggregate({
    where: {
      ...where,
      type: "OUT",
    },
    _sum: {
      quantity: true,
    },
  });

  const mixUsage = await prisma.mixLog.aggregate({
    where,
    _sum: {
      actualQty: true,
    },
  });

  const stockOutQty = Math.abs(stockOut._sum.quantity || 0);
  const mixUsageQty = mixUsage._sum.actualQty || 0;
  const mismatch = stockOutQty - mixUsageQty;
  const mismatchPercent =
    stockOutQty > 0 ? (mismatch / stockOutQty) * 100 : 0;

  return {
    stockOutQty,
    mixUsageQty,
    mismatch,
    mismatchPercent: Math.round(mismatchPercent * 100) / 100,
  };
}

