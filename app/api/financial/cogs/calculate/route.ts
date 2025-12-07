// ============================================
// PHASE 32C - COGS & Product Cost Engine
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/financial/cogs/calculate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      bookingId,
      invoiceId,
      productsUsed, // Array of {productId, quantity, unit}
      branchId,
      staffId,
      date,
    } = body;

    if (!productsUsed || !Array.isArray(productsUsed) || productsUsed.length === 0) {
      return errorResponse("Products used are required", 400);
    }

    // Calculate COGS for each product
    const productsCalculated = await Promise.all(
      productsUsed.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        // Calculate unit cost (cost per gram/ml based on product unit)
        let unitCost = 0;
        if (product.unit === "g" || product.unit === "ml") {
          // Cost per gram/ml
          unitCost = (product.cost || 0) / (product.stockQuantity || 1);
        } else {
          // Cost per unit
          unitCost = product.cost || 0;
        }

        const totalCost = unitCost * (item.quantity || 0);

        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unit: item.unit || product.unit,
          unitCost,
          totalCost,
        };
      })
    );

    const totalCOGS = productsCalculated.reduce((sum, p) => sum + p.totalCost, 0);

    // Create COGS record
    const cogs = await prisma.cOGSCalculation.create({
      data: {
        serviceId: serviceId || null,
        bookingId: bookingId || null,
        invoiceId: invoiceId || null,
        productsUsed: productsCalculated,
        totalCOGS,
        quantity: productsUsed.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0),
        cogsPerUnit: null, // Would calculate if quantity provided
        date: date ? new Date(date) : new Date(),
        branchId: branchId || null,
        staffId: staffId || null,
      },
    });

    return successResponse(cogs);
  } catch (error: any) {
    console.error("Error calculating COGS:", error);
    return errorResponse(error.message || "Failed to calculate COGS", 500);
  }
}

// GET /api/financial/cogs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchId = searchParams.get("branchId");
    const serviceId = searchParams.get("serviceId");

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (branchId) where.branchId = branchId;
    if (serviceId) where.serviceId = serviceId;

    const cogsRecords = await prisma.cOGSCalculation.findMany({
      where,
      orderBy: { date: "desc" },
      take: 1000,
    });

    const totalCOGS = cogsRecords.reduce((sum, c) => sum + c.totalCOGS, 0);

    return successResponse({
      cogs: cogsRecords,
      total: totalCOGS,
      count: cogsRecords.length,
    });
  } catch (error: any) {
    console.error("Error fetching COGS:", error);
    return errorResponse(error.message || "Failed to fetch COGS", 500);
  }
}

