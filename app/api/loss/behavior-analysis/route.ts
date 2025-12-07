// ============================================
// Behavior Analysis - Analyze staff behavior
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getThreshold } from "@/lib/thresholds";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const productId = searchParams.get("productId");
    const days = parseInt(searchParams.get("days") || "30");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      createdAt: { gte: since },
    };
    if (staffId) where.staffId = staffId;
    if (productId) where.productId = productId;

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
    });

    if (mixLogs.length === 0) {
      return NextResponse.json({
        success: true,
        analysis: [],
      });
    }

    // Group by staff and product
    const analysis: Record<
      string,
      {
        staffId: string;
        staffName: string;
        products: Record<
          string,
          {
            productId: string;
            productName: string;
            category: string;
            unit: string;
            count: number;
            totalUsed: number;
            averageUsed: number;
            totalExpected: number;
            averageExpected: number;
            totalLoss: number;
            averageLossRate: number;
            deviation: number; // % so với mức chuẩn
            threshold: any;
            issues: string[];
          }
        >;
        totalServices: number;
        overallLossRate: number;
      }
    > = {};

    for (const log of mixLogs) {
      const staffKey = log.staffId;
      if (!analysis[staffKey]) {
        analysis[staffKey] = {
          staffId: log.staffId,
          staffName: log.staff.name,
          products: {},
          totalServices: 0,
          overallLossRate: 0,
        };
      }

      const productKey = log.productId;
      if (!analysis[staffKey].products[productKey]) {
        const threshold = getThreshold(
          log.product.category,
          undefined,
          log.productId,
          log.serviceId || undefined
        );

        analysis[staffKey].products[productKey] = {
          productId: log.productId,
          productName: log.product.name,
          category: log.product.category,
          unit: log.product.unit,
          count: 0,
          totalUsed: 0,
          averageUsed: 0,
          totalExpected: 0,
          averageExpected: 0,
          totalLoss: 0,
          averageLossRate: 0,
          deviation: 0,
          threshold,
          issues: [],
        };
      }

      const product = analysis[staffKey].products[productKey];
      product.count++;
      product.totalUsed += log.actualQty;
      product.averageUsed = product.totalUsed / product.count;

      if (log.expectedQty) {
        product.totalExpected += log.expectedQty;
        product.averageExpected = product.totalExpected / product.count;
        const loss = log.actualQty - log.expectedQty;
        product.totalLoss += loss;
        product.averageLossRate =
          (product.totalLoss / product.totalExpected) * 100;
      }

      analysis[staffKey].totalServices++;
    }

    // Calculate deviations and issues
    for (const staffKey in analysis) {
      const staff = analysis[staffKey];
      let totalLoss = 0;
      let totalExpected = 0;

      for (const productKey in staff.products) {
        const product = staff.products[productKey];

        // Calculate deviation from threshold
        if (product.threshold) {
          const expectedRange =
            ((product.threshold.expectedMin || 0) +
              (product.threshold.expectedMax || 0)) /
            2;
          if (expectedRange > 0) {
            product.deviation =
              ((product.averageUsed - expectedRange) / expectedRange) * 100;
          }

          // Check issues
          if (product.averageLossRate > (product.threshold.criticalMin || 25)) {
            product.issues.push(
              `Hao hụt ${product.averageLossRate.toFixed(1)}% vượt mức nguy hiểm (${product.threshold.criticalMin}%)`
            );
          } else if (
            product.averageLossRate > (product.threshold.alertMax || 25)
          ) {
            product.issues.push(
              `Hao hụt ${product.averageLossRate.toFixed(1)}% ở mức cảnh báo`
            );
          }

          if (product.deviation > 30) {
            product.issues.push(
              `Dùng nhiều hơn mức chuẩn ${product.deviation.toFixed(1)}%`
            );
          }
        }

        totalLoss += product.totalLoss;
        totalExpected += product.totalExpected;
      }

      staff.overallLossRate =
        totalExpected > 0 ? (totalLoss / totalExpected) * 100 : 0;
    }

    // Compare with other staff
    const staffAverages: Record<string, number> = {};
    for (const staffKey in analysis) {
      for (const productKey in analysis[staffKey].products) {
        if (!staffAverages[productKey]) {
          staffAverages[productKey] = 0;
        }
        staffAverages[productKey] +=
          analysis[staffKey].products[productKey].averageUsed;
      }
    }

    // Count staff per product
    const staffCounts: Record<string, number> = {};
    for (const staffKey in analysis) {
      for (const productKey in analysis[staffKey].products) {
        staffCounts[productKey] = (staffCounts[productKey] || 0) + 1;
      }
    }

    // Calculate averages
    for (const productKey in staffAverages) {
      staffAverages[productKey] /= staffCounts[productKey] || 1;
    }

    // Add comparison issues
    for (const staffKey in analysis) {
      for (const productKey in analysis[staffKey].products) {
        const product = analysis[staffKey].products[productKey];
        const avg = staffAverages[productKey] || 0;

        if (avg > 0 && product.averageUsed > avg * 1.3) {
          product.issues.push(
            `Dùng nhiều hơn ${((product.averageUsed / avg - 1) * 100).toFixed(1)}% so với trung bình nhân viên khác`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      analysis: Object.values(analysis),
      period: {
        days,
        startDate: since,
        endDate: new Date(),
      },
    });
  } catch (err: any) {
    console.error("Behavior analysis error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze behavior",
      },
      { status: 500 }
    );
  }
}

