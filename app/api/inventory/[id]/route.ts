import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/inventory/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        inventoryLogs: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch product", 500);
  }
}

// PUT /api/inventory/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      categoryId,
      name,
      sku,
      description,
      cost,
      price,
      stockQuantity,
      minStockLevel,
      unit,
      image,
      isActive,
    } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        categoryId,
        name,
        sku,
        description,
        cost: cost ? parseFloat(cost) : undefined,
        price: price ? parseFloat(price) : undefined,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined,
        minStockLevel: minStockLevel !== undefined ? parseInt(minStockLevel) : undefined,
        unit,
        image,
        isActive,
      },
      include: {
        category: true,
      },
    });

    return successResponse(product, "Product updated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Product not found", 404);
    }
    if (error.code === "P2002") {
      return errorResponse("SKU already exists", 409);
    }
    return errorResponse(error.message || "Failed to update product", 500);
  }
}

// DELETE /api/inventory/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.update({
      where: { id: params.id },
      data: {
        isActive: false,
      },
    });

    return successResponse(null, "Product deactivated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Product not found", 404);
    }
    return errorResponse(error.message || "Failed to deactivate product", 500);
  }
}

