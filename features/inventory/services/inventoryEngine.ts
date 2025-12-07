// ============================================
// Inventory Engine
// ============================================

import { prisma } from "@/lib/prisma";
import {
  ProductStock,
  StockTransaction,
  LowStockAlert,
  UsageTrend,
} from "../types";
import { StockTransactionType } from "@prisma/client";
import { subDays, subMonths } from "date-fns";

/**
 * Add stock to a product in a branch
 */
export async function addStock(
  productId: string,
  branchId: string,
  quantity: number,
  createdBy: string,
  reason?: string,
  notes?: string
): Promise<void> {
  // Create or update ProductStock
  const stock = await prisma.productStock.upsert({
    where: {
      productId_branchId: {
        productId,
        branchId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      productId,
      branchId,
      quantity,
    },
  });

  // Create transaction record
  await prisma.stockTransaction.create({
    data: {
      productId,
      branchId,
      type: StockTransactionType.IN,
      quantity,
      reason: reason || "manual",
      notes,
      createdBy,
    },
  });
}

/**
 * Remove stock from a product in a branch
 */
export async function removeStock(
  productId: string,
  branchId: string,
  quantity: number,
  createdBy: string,
  reason: string = "manual",
  reference?: string,
  notes?: string
): Promise<void> {
  // Check current stock
  const stock = await prisma.productStock.findUnique({
    where: {
      productId_branchId: {
        productId,
        branchId,
      },
    },
  });

  if (!stock || Number(stock.quantity) < quantity) {
    throw new Error("Insufficient stock");
  }

  // Update stock
  await prisma.productStock.update({
    where: {
      productId_branchId: {
        productId,
        branchId,
      },
    },
    data: {
      quantity: { decrement: quantity },
    },
  });

  // Create transaction record
  await prisma.stockTransaction.create({
    data: {
      productId,
      branchId,
      type: StockTransactionType.OUT,
      quantity,
      reason,
      reference,
      notes,
      createdBy,
    },
  });
}

/**
 * Adjust stock (manual correction)
 */
export async function adjustStock(
  productId: string,
  branchId: string,
  newQuantity: number,
  createdBy: string,
  notes?: string
): Promise<void> {
  const stock = await prisma.productStock.findUnique({
    where: {
      productId_branchId: {
        productId,
        branchId,
      },
    },
  });

  const currentQuantity = stock ? Number(stock.quantity) : 0;
  const adjustment = newQuantity - currentQuantity;

  // Update or create stock
  await prisma.productStock.upsert({
    where: {
      productId_branchId: {
        productId,
        branchId,
      },
    },
    update: {
      quantity: newQuantity,
    },
    create: {
      productId,
      branchId,
      quantity: newQuantity,
    },
  });

  // Create transaction record
  await prisma.stockTransaction.create({
    data: {
      productId,
      branchId,
      type: StockTransactionType.ADJUST,
      quantity: Math.abs(adjustment),
      reason: "adjustment",
      notes: notes || `Adjusted from ${currentQuantity} to ${newQuantity}`,
      createdBy,
    },
  });
}

/**
 * Get stock levels for all products in a branch
 */
export async function getStockLevels(
  branchId: string
): Promise<ProductStock[]> {
  const stocks = await prisma.productStock.findMany({
    where: { branchId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
          category: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      product: {
        name: "asc",
      },
    },
  });

  return stocks.map((stock) => ({
    id: stock.id,
    productId: stock.productId,
    branchId: stock.branchId,
    quantity: Number(stock.quantity),
    minLevel: stock.minLevel ? Number(stock.minLevel) : null,
    maxLevel: stock.maxLevel ? Number(stock.maxLevel) : null,
    product: stock.product,
    branch: stock.branch,
  }));
}

/**
 * Get low stock alerts for a branch
 */
export async function getLowStockAlerts(
  branchId: string
): Promise<LowStockAlert[]> {
  const stocks = await prisma.productStock.findMany({
    where: {
      branchId,
      OR: [
        {
          minLevel: {
            not: null,
          },
          quantity: {
            lte: prisma.productStock.fields.minLevel,
          },
        },
        {
          minLevel: null,
          quantity: {
            lte: 0,
          },
        },
      ],
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          unit: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const alerts: LowStockAlert[] = [];

  for (const stock of stocks) {
    const currentStock = Number(stock.quantity);
    const minLevel = stock.minLevel ? Number(stock.minLevel) : 0;

    // Calculate daily usage (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const usageResult = await prisma.stockTransaction.aggregate({
      where: {
        productId: stock.productId,
        branchId,
        type: StockTransactionType.OUT,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const totalUsed = Number(usageResult._sum.quantity || 0);
    const dailyUsage = totalUsed / 30;
    const daysUntilOut = dailyUsage > 0 ? currentStock / dailyUsage : 999;

    let severity: "CRITICAL" | "WARNING" | "LOW";
    if (currentStock <= 0) {
      severity = "CRITICAL";
    } else if (daysUntilOut <= 3) {
      severity = "CRITICAL";
    } else if (daysUntilOut <= 7) {
      severity = "WARNING";
    } else {
      severity = "LOW";
    }

    alerts.push({
      productId: stock.productId,
      productName: stock.product.name,
      branchId,
      branchName: stock.branch.name,
      currentStock,
      minLevel,
      daysUntilOut: Math.floor(daysUntilOut),
      severity,
    });
  }

  return alerts.sort((a, b) => {
    const severityOrder = { CRITICAL: 0, WARNING: 1, LOW: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Auto deduct chemicals for a completed service
 */
export async function autoDeductForService(
  bookingId: string,
  createdBy: string
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
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
      branch: true,
    },
  });

  if (!booking || !booking.branchId) {
    throw new Error("Booking not found or no branch assigned");
  }

  // Deduct products for each service
  for (const bookingService of booking.bookingServices) {
    const service = bookingService.service;

    for (const usage of service.productUsages) {
      const product = usage.product;
      const amountUsed = Number(usage.amountUsed);

      // Only deduct if product is branch-aware
      if (product.branchAware) {
        try {
          await removeStock(
            product.id,
            booking.branchId,
            amountUsed,
            createdBy,
            "serviceUsage",
            bookingId,
            `Auto-deducted for service: ${service.name}`
          );
        } catch (error: any) {
          console.error(
            `Failed to deduct ${product.name} for booking ${bookingId}:`,
            error.message
          );
          // Continue with other products even if one fails
        }
      }
    }
  }
}

/**
 * Calculate usage trends for a product
 */
export async function calculateUsageTrends(
  productId: string,
  branchId: string,
  period: "week" | "month" = "month"
): Promise<UsageTrend> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const now = new Date();
  const currentPeriodStart =
    period === "week"
      ? subDays(now, 7)
      : subMonths(now, 1);
  const previousPeriodStart =
    period === "week"
      ? subDays(now, 14)
      : subMonths(now, 2);
  const previousPeriodEnd = currentPeriodStart;

  // Current period usage
  const currentUsage = await prisma.stockTransaction.aggregate({
    where: {
      productId,
      branchId,
      type: StockTransactionType.OUT,
      reason: "serviceUsage",
      createdAt: {
        gte: currentPeriodStart,
      },
    },
    _sum: {
      quantity: true,
    },
  });

  // Previous period usage
  const previousUsage = await prisma.stockTransaction.aggregate({
    where: {
      productId,
      branchId,
      type: StockTransactionType.OUT,
      reason: "serviceUsage",
      createdAt: {
        gte: previousPeriodStart,
        lt: previousPeriodEnd,
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const currentTotal = Number(currentUsage._sum.quantity || 0);
  const previousTotal = Number(previousUsage._sum.quantity || 0);

  // Count services in current period
  const serviceCount = await prisma.stockTransaction.count({
    where: {
      productId,
      branchId,
      type: StockTransactionType.OUT,
      reason: "serviceUsage",
      createdAt: {
        gte: currentPeriodStart,
      },
    },
  });

  const averagePerService =
    serviceCount > 0 ? currentTotal / serviceCount : 0;

  const trend =
    previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

  // Forecast next 30 days (simple: average daily usage * 30)
  const daysInPeriod = period === "week" ? 7 : 30;
  const dailyUsage = currentTotal / daysInPeriod;
  const forecastNext30Days = dailyUsage * 30;

  return {
    productId,
    productName: product.name,
    branchId,
    period,
    totalUsed: currentTotal,
    averagePerService,
    trend,
    forecastNext30Days,
  };
}

/**
 * Get stock transactions for a branch
 */
export async function getStockTransactions(
  branchId: string,
  limit: number = 50
): Promise<StockTransaction[]> {
  const transactions = await prisma.stockTransaction.findMany({
    where: { branchId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          unit: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return transactions.map((t) => ({
    id: t.id,
    productId: t.productId,
    branchId: t.branchId,
    type: t.type,
    quantity: Number(t.quantity),
    reason: t.reason,
    reference: t.reference,
    notes: t.notes,
    createdBy: t.createdBy,
    createdAt: t.createdAt,
    product: t.product,
    branch: t.branch,
  }));
}

