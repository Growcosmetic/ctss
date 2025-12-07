// ============================================
// Service Cost - Calculate Cost
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      serviceId,
      visitId,
      invoiceId,
      servicePrice,
      items, // Array of { productId, quantity }
    } = await req.json();

    if (!serviceId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "serviceId and items are required" },
        { status: 400 }
      );
    }

    // Get service to get default price if not provided
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const finalServicePrice = servicePrice || service.price;
    let totalCost = 0;
    const costItems = [];

    for (const item of items) {
      const { productId, quantity } = item;

      // Get product
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        continue; // Skip invalid products
      }

      // Get current price per unit
      const unitPrice = product.pricePerUnit || 0;
      const itemCost = quantity * unitPrice;
      totalCost += itemCost;

      // Create ServiceCost record (margin will be calculated after all items)
      const serviceCost = await prisma.serviceCost.create({
        data: {
          serviceId,
          visitId: visitId || null,
          invoiceId: invoiceId || null,
          productId,
          quantityUsed: quantity,
          unitPrice,
          totalCost: itemCost,
          servicePrice: finalServicePrice,
          margin: null, // Will update after calculating total
        },
      });

      costItems.push({
        product: {
          id: product.id,
          name: product.name,
          unit: product.unit,
        },
        quantity,
        unitPrice,
        totalCost: itemCost,
      });
    }

    // Calculate overall margin
    const margin =
      finalServicePrice > 0
        ? ((finalServicePrice - totalCost) / finalServicePrice) * 100
        : 0;
    const profit = finalServicePrice - totalCost;

    return NextResponse.json({
      success: true,
      serviceId,
      servicePrice: finalServicePrice,
      totalCost,
      profit,
      margin: Math.round(margin * 100) / 100,
      items: costItems,
      breakdown: {
        costPercentage:
          finalServicePrice > 0 ? (totalCost / finalServicePrice) * 100 : 0,
        profitPercentage: margin,
      },
    });
  } catch (err: any) {
    console.error("Calculate service cost error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to calculate service cost",
      },
      { status: 500 }
    );
  }
}

