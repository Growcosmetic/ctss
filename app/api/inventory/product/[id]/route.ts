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
      category,
      subCategory,
      unit,
      capacity,
      capacityUnit,
      pricePerUnit,
      minStock,
      maxStock,
      supplier,
      notes,
    } = body;

    if (!name || !category || !unit) {
      return errorResponse("Name, category, and unit are required", 400);
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        category,
        subCategory: subCategory || null,
        unit,
        capacity: capacity !== undefined && capacity !== null ? parseFloat(capacity.toString()) : null,
        capacityUnit: capacityUnit || null,
        pricePerUnit: pricePerUnit !== undefined && pricePerUnit !== null ? parseFloat(pricePerUnit.toString()) : null,
        minStock: minStock !== undefined && minStock !== null ? parseFloat(minStock.toString()) : null,
        maxStock: maxStock !== undefined && maxStock !== null ? parseFloat(maxStock.toString()) : null,
        supplier: supplier || null,
        notes: notes || null,
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
