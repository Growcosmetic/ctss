import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

// Simple token validation
function validateToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    return userId || null;
  } catch {
    return null;
  }
}

// GET /api/inventory/product/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
          },
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

// PUT /api/inventory/product/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    const body = await request.json();
    const {
      name,
      sku,
      category,
      subCategory,
      unit,
      capacity,
      capacityUnit,
      pricePerUnit,
      costPrice,
      minStock,
      maxStock,
      supplierId,
      notes,
      isActive,
    } = body;

    if (!name || !category || !unit) {
      return errorResponse("Name, category, and unit are required", 400);
    }

    // Check SKU uniqueness if provided
    if (sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: sku.trim().toUpperCase(),
          NOT: { id: params.id },
        },
      });

      if (existingSku) {
        return errorResponse("Mã SKU đã tồn tại", 409);
      }
    }

    const updateData: any = {
      name,
      category,
      subCategory: subCategory || null,
      unit,
      capacity: capacity !== undefined && capacity !== null ? parseFloat(capacity.toString()) : null,
      capacityUnit: capacityUnit || null,
      pricePerUnit: pricePerUnit !== undefined && pricePerUnit !== null ? parseFloat(pricePerUnit.toString()) : null,
      costPrice: costPrice !== undefined && costPrice !== null ? parseFloat(costPrice.toString()) : null,
      minStock: minStock !== undefined && minStock !== null ? parseFloat(minStock.toString()) : null,
      maxStock: maxStock !== undefined && maxStock !== null ? parseFloat(maxStock.toString()) : null,
      supplierId: supplierId !== undefined ? (supplierId || null) : undefined,
      notes: notes !== undefined ? (notes || null) : undefined,
    };

    if (sku !== undefined) {
      updateData.sku = sku ? sku.trim().toUpperCase() : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
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
