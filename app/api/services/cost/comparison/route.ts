// ============================================
// Service Cost - Compare Services
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get all service costs grouped by service
    const serviceCosts = await prisma.serviceCost.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
          },
        },
        product: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    // Group by service
    const serviceStats: Record<
      string,
      {
        serviceId: string;
        serviceName: string;
        category: string;
        defaultPrice: number;
        count: number;
        totalCost: number;
        averageCost: number;
        totalRevenue: number;
        averageRevenue: number;
        totalProfit: number;
        averageProfit: number;
        averageMargin: number;
        productsUsed: Record<
          string,
          {
            productName: string;
            totalQuantity: number;
            averageQuantity: number;
            totalCost: number;
          }
        >;
      }
    > = {};

    for (const cost of serviceCosts) {
      if (!cost.service) continue;

      const serviceId = cost.serviceId;
      if (!serviceStats[serviceId]) {
        serviceStats[serviceId] = {
          serviceId,
          serviceName: cost.service.name,
          category: cost.service.category,
          defaultPrice: cost.service.price,
          count: 0,
          totalCost: 0,
          averageCost: 0,
          totalRevenue: 0,
          averageRevenue: 0,
          totalProfit: 0,
          averageProfit: 0,
          averageMargin: 0,
          productsUsed: {},
        };
      }

      const stat = serviceStats[serviceId];
      stat.count++;
      stat.totalCost += cost.totalCost;
      stat.averageCost = stat.totalCost / stat.count;

      if (cost.servicePrice) {
        stat.totalRevenue += cost.servicePrice;
        stat.averageRevenue = stat.totalRevenue / stat.count;
        const profit = cost.servicePrice - cost.totalCost;
        stat.totalProfit += profit;
        stat.averageProfit = stat.totalProfit / stat.count;
        stat.averageMargin =
          stat.averageRevenue > 0
            ? (stat.averageProfit / stat.averageRevenue) * 100
            : 0;
      }

      // Track products used
      const productKey = cost.product.name;
      if (!stat.productsUsed[productKey]) {
        stat.productsUsed[productKey] = {
          productName: cost.product.name,
          totalQuantity: 0,
          averageQuantity: 0,
          totalCost: 0,
        };
      }

      stat.productsUsed[productKey].totalQuantity += cost.quantityUsed;
      stat.productsUsed[productKey].totalCost += cost.totalCost;
      stat.productsUsed[productKey].averageQuantity =
        stat.productsUsed[productKey].totalQuantity / stat.count;
    }

    // Convert to array and sort by average margin (desc)
    const comparison = Object.values(serviceStats).sort(
      (a, b) => b.averageMargin - a.averageMargin
    );

    return NextResponse.json({
      success: true,
      comparison,
      total: comparison.length,
    });
  } catch (err: any) {
    console.error("Service cost comparison error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to compare service costs",
      },
      { status: 500 }
    );
  }
}

