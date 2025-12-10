// ============================================
// Services - Bulk Update Category
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/services/bulk-update-category
// Update category for all services matching oldCategory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldCategory, newCategory } = body;

    if (!oldCategory || !newCategory) {
      return errorResponse("oldCategory and newCategory are required", 400);
    }

    if (oldCategory === newCategory) {
      return errorResponse("oldCategory and newCategory cannot be the same", 400);
    }

    // Update all services with oldCategory to newCategory
    const result = await prisma.service.updateMany({
      where: {
        category: { equals: oldCategory, mode: "insensitive" },
      },
      data: {
        category: newCategory,
      },
    });

    return successResponse({
      updated: result.count,
      oldCategory,
      newCategory,
    });
  } catch (err: any) {
    console.error("Bulk update category error:", err);
    return errorResponse(`Failed to update category: ${err.message}`, 500);
  }
}
