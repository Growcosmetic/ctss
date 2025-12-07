// ============================================
// AI Manager - Inventory KPIs
// ============================================

import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";
import { getLowStockAlerts, calculateUsageTrends } from "@/features/inventory/services/inventoryEngine";
import { predictStockOut, detectOverUsage, detectAbnormalConsumption } from "@/features/inventory/services/inventoryAI";

/**
 * Get inventory KPIs for AI Manager
 */
export async function getInventoryKPIs(branchId: string) {
  const thirtyDaysAgo = subDays(new Date(), 30);

  // Low stock alerts
  const alerts = await getLowStockAlerts(branchId);

  // Top consuming products
  const topConsuming = await prisma.stockTransaction.groupBy({
    by: ["productId"],
    where: {
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
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 10,
  });

  const topConsumingWithNames = await Promise.all(
    topConsuming.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, unit: true },
      });
      return {
        productId: item.productId,
        productName: product?.name || "Unknown",
        totalUsed: Number(item._sum.quantity || 0),
        unit: product?.unit || "ml",
      };
    })
  );

  // Chemical cost per service
  const completedBookings = await prisma.booking.count({
    where: {
      branchId,
      status: "COMPLETED",
      bookingDate: {
        gte: thirtyDaysAgo,
      },
    },
  });

  const totalChemicalCost = await prisma.stockTransaction.aggregate({
    where: {
      branchId,
      type: "OUT",
      reason: "serviceUsage",
      createdAt: {
        gte: thirtyDaysAgo,
      },
      product: {
        category: "chemical",
      },
    },
    _sum: {
      quantity: true,
    },
  });

  // Get average cost per unit (simplified)
  const avgCostPerUnit = 50000; // VND per ml (would calculate from Product.cost)
  const totalCost = Number(totalChemicalCost._sum.quantity || 0) * avgCostPerUnit;
  const costPerService = completedBookings > 0 ? totalCost / completedBookings : 0;

  return {
    lowStockAlerts: alerts.length,
    criticalAlerts: alerts.filter((a) => a.severity === "CRITICAL").length,
    topConsumingProducts: topConsumingWithNames,
    totalChemicalCost: totalCost,
    costPerService: costPerService,
    completedServices: completedBookings,
  };
}

/**
 * Get inventory forecasts for AI Manager
 */
export async function getInventoryForecasts(branchId: string) {
  const products = await prisma.product.findMany({
    where: {
      branchAware: true,
      category: "chemical",
      isActive: true,
      productStocks: {
        some: {
          branchId,
        },
      },
    },
    include: {
      productStocks: {
        where: { branchId },
      },
    },
  });

  const forecasts = [];

  for (const product of products) {
    try {
      const forecast = await predictStockOut(product.id, branchId);
      if (forecast.daysUntilOut < 30) {
        forecasts.push(forecast);
      }
    } catch (error) {
      console.error(`Error forecasting for product ${product.id}:`, error);
    }
  }

  return forecasts.sort((a, b) => a.daysUntilOut - b.daysUntilOut);
}

