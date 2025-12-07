// ============================================
// Inventory AI - Predictions & Alerts
// ============================================

import { prisma } from "@/lib/prisma";
import {
  InventoryForecast,
  LowStockAlert,
  UsageTrend,
} from "../types";
import { calculateUsageTrends, getLowStockAlerts } from "./inventoryEngine";
import { subDays, addDays } from "date-fns";

/**
 * Predict when products will run out
 */
export async function predictStockOut(
  productId: string,
  branchId: string
): Promise<InventoryForecast> {
  const stock = await prisma.productStock.findUnique({
    where: {
      productId_branchId: {
        productId,
        branchId,
      },
    },
    include: {
      product: {
        select: {
          name: true,
          unit: true,
        },
      },
    },
  });

  if (!stock) {
    throw new Error("Stock not found");
  }

  // Get usage trends
  const trends = await calculateUsageTrends(productId, branchId, "month");

  const currentStock = Number(stock.quantity);
  const dailyUsage = trends.totalUsed / 30; // Average daily usage
  const daysUntilOut = dailyUsage > 0 ? currentStock / dailyUsage : 999;

  // Calculate recommended reorder quantity (30 days supply + buffer)
  const recommendedReorder = Math.ceil(dailyUsage * 45); // 45 days supply

  // Confidence based on data availability
  const transactionCount = await prisma.stockTransaction.count({
    where: {
      productId,
      branchId,
      type: "OUT",
      reason: "serviceUsage",
      createdAt: {
        gte: subDays(new Date(), 60),
      },
    },
  });

  const confidence = Math.min(1, transactionCount / 20); // More data = higher confidence

  return {
    productId,
    productName: stock.product.name,
    branchId,
    currentStock,
    dailyUsage,
    daysUntilOut: Math.floor(daysUntilOut),
    recommendedReorder,
    confidence,
  };
}

/**
 * Detect over-usage by stylist (possible wasting)
 */
export async function detectOverUsage(
  branchId: string,
  days: number = 30
): Promise<
  Array<{
    staffId: string;
    staffName: string;
    productId: string;
    productName: string;
    averageUsage: number;
    expectedUsage: number;
    variance: number; // percentage
  }>
> {
  const startDate = subDays(new Date(), days);

  // Get all service completions with staff assignments
  const bookings = await prisma.booking.findMany({
    where: {
      branchId,
      status: "COMPLETED",
      bookingDate: {
        gte: startDate,
      },
      staffId: {
        not: null,
      },
    },
    include: {
      staff: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      bookingServices: {
        include: {
          service: {
            include: {
              productUsages: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Group by staff and product
  const staffProductUsage = new Map<
    string,
    Map<string, { total: number; count: number }>
  >();

  for (const booking of bookings) {
    if (!booking.staffId) continue;

    const staffKey = booking.staffId;
    if (!staffProductUsage.has(staffKey)) {
      staffProductUsage.set(staffKey, new Map());
    }

    const productMap = staffProductUsage.get(staffKey)!;

    for (const bookingService of booking.bookingServices) {
      for (const usage of bookingService.service.productUsages) {
        const productKey = usage.productId;
        if (!productMap.has(productKey)) {
          productMap.set(productKey, { total: 0, count: 0 });
        }

        const current = productMap.get(productKey)!;
        current.total += Number(usage.amountUsed);
        current.count += 1;
      }
    }
  }

  // Calculate averages and compare with expected
  const overUsage: Array<{
    staffId: string;
    staffName: string;
    productId: string;
    productName: string;
    averageUsage: number;
    expectedUsage: number;
    variance: number;
  }> = [];

  for (const [staffId, productMap] of staffProductUsage.entries()) {
    const staff = bookings.find((b) => b.staffId === staffId)?.staff;
    if (!staff) continue;

    for (const [productId, usage] of productMap.entries()) {
      const averageUsage = usage.count > 0 ? usage.total / usage.count : 0;

      // Get expected usage from service definition
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          serviceUsages: true,
        },
      });

      if (!product) continue;

      // Calculate expected usage (average from service definitions)
      const expectedUsage =
        product.serviceUsages.length > 0
          ? product.serviceUsages.reduce(
              (sum, u) => sum + Number(u.amountUsed),
              0
            ) / product.serviceUsages.length
          : Number(product.defaultUsage || 0);

      if (expectedUsage > 0) {
        const variance = ((averageUsage - expectedUsage) / expectedUsage) * 100;

        // Flag if usage is 20%+ above expected
        if (variance > 20) {
          overUsage.push({
            staffId,
            staffName: `${staff.user.firstName} ${staff.user.lastName}`,
            productId,
            productName: product.name,
            averageUsage,
            expectedUsage,
            variance,
          });
        }
      }
    }
  }

  return overUsage.sort((a, b) => b.variance - a.variance);
}

/**
 * Detect abnormal consumption patterns
 */
export async function detectAbnormalConsumption(
  branchId: string
): Promise<
  Array<{
    productId: string;
    productName: string;
    pattern: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    description: string;
  }>
> {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const sixtyDaysAgo = subDays(new Date(), 60);

  // Get all products with usage
  const products = await prisma.product.findMany({
    where: {
      branchAware: true,
      category: "chemical",
      isActive: true,
    },
  });

  const anomalies: Array<{
    productId: string;
    productName: string;
    pattern: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    description: string;
  }> = [];

  for (const product of products) {
    // Get usage in last 30 days
    const recentUsage = await prisma.stockTransaction.aggregate({
      where: {
        productId: product.id,
        branchId,
        type: "OUT",
        reason: "serviceUsage",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Get usage in previous 30 days
    const previousUsage = await prisma.stockTransaction.aggregate({
      where: {
        productId: product.id,
        branchId,
        type: "OUT",
        reason: "serviceUsage",
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const recentTotal = Number(recentUsage._sum.quantity || 0);
    const previousTotal = Number(previousUsage._sum.quantity || 0);

    if (previousTotal > 0) {
      const change = ((recentTotal - previousTotal) / previousTotal) * 100;

      // Detect sudden increase (>50%)
      if (change > 50) {
        anomalies.push({
          productId: product.id,
          productName: product.name,
          pattern: "SUDDEN_INCREASE",
          severity: change > 100 ? "HIGH" : "MEDIUM",
          description: `Usage tăng ${change.toFixed(0)}% so với tháng trước`,
        });
      }

      // Detect sudden decrease (>50%)
      if (change < -50) {
        anomalies.push({
          productId: product.id,
          productName: product.name,
          pattern: "SUDDEN_DECREASE",
          severity: change < -80 ? "HIGH" : "MEDIUM",
          description: `Usage giảm ${Math.abs(change).toFixed(0)}% so với tháng trước`,
        });
      }
    }
  }

  return anomalies;
}

/**
 * Get recommended stock levels based on service volume
 */
export async function getRecommendedStockLevels(
  branchId: string
): Promise<
  Array<{
    productId: string;
    productName: string;
    currentStock: number;
    recommendedMin: number;
    recommendedMax: number;
    reasoning: string;
  }>
> {
  const thirtyDaysAgo = subDays(new Date(), 30);

  // Get service volume for the branch
  const serviceCount = await prisma.booking.count({
    where: {
      branchId,
      bookingDate: {
        gte: thirtyDaysAgo,
      },
      status: "COMPLETED",
    },
  });

  const dailyServiceVolume = serviceCount / 30;

  // Get all chemical products
  const products = await prisma.product.findMany({
    where: {
      branchAware: true,
      category: "chemical",
      isActive: true,
    },
    include: {
      productStocks: {
        where: { branchId },
      },
      serviceUsages: true,
    },
  });

  const recommendations: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    recommendedMin: number;
    recommendedMax: number;
    reasoning: string;
  }> = [];

  for (const product of products) {
    const stock = product.productStocks[0];
    const currentStock = stock ? Number(stock.quantity) : 0;

    // Calculate average usage per service
    const avgUsagePerService =
      product.serviceUsages.length > 0
        ? product.serviceUsages.reduce(
            (sum, u) => sum + Number(u.amountUsed),
            0
          ) / product.serviceUsages.length
        : Number(product.defaultUsage || 0);

    // Recommended: 30 days supply (min) and 60 days supply (max)
    const dailyUsage = (dailyServiceVolume * avgUsagePerService) / 30;
    const recommendedMin = Math.ceil(dailyUsage * 30);
    const recommendedMax = Math.ceil(dailyUsage * 60);

    recommendations.push({
      productId: product.id,
      productName: product.name,
      currentStock,
      recommendedMin,
      recommendedMax,
      reasoning: `Dựa trên ${dailyServiceVolume.toFixed(1)} dịch vụ/ngày và ${avgUsagePerService.toFixed(2)} ${product.unit}/dịch vụ`,
    });
  }

  return recommendations;
}

