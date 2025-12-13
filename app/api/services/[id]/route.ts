import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireSalonId, verifySalonAccess } from "@/lib/api-helpers";

// GET /api/services/[id] - Get service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    // Verify service belongs to current salon
    await verifySalonAccess(salonId, "service", params.id);

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      // Note: category is a String field, not a relation, so we don't include it
    });

    if (!service) {
      return errorResponse("Service not found", 404);
    }

    return successResponse(service);
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return errorResponse(error.message || "Service not found", error.statusCode);
    }
    return errorResponse(error.message || "Failed to fetch service", 500);
  }
}

// PUT /api/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    // Verify service belongs to current salon
    await verifySalonAccess(salonId, "service", params.id);

    const body = await request.json();
    const {
      category,
      categoryId, // Support both for backward compatibility
      name,
      code,
      description,
      englishName,
      englishDescription,
      duration,
      price,
      cost,
      image,
      isActive,
      allowPriceOverride,
      unit,
      displayLocation,
      sortOrder,
    } = body;

    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (categoryId !== undefined) updateData.category = categoryId; // Map categoryId to category
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (englishName !== undefined) updateData.englishName = englishName;
    if (englishDescription !== undefined) updateData.englishDescription = englishDescription;
    if (duration !== undefined) updateData.duration = parseInt(String(duration));
    if (price !== undefined) updateData.price = parseInt(String(price));
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (allowPriceOverride !== undefined) updateData.allowPriceOverride = allowPriceOverride;
    if (unit !== undefined) updateData.unit = unit;
    if (displayLocation !== undefined) updateData.displayLocation = displayLocation;

    const service = await prisma.service.update({
      where: { id: params.id },
      data: updateData,
    });

    return successResponse(service, "Service updated successfully");
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return errorResponse(error.message || "Service not found", error.statusCode);
    }
    if (error.code === "P2025") {
      return errorResponse("Service not found", 404);
    }
    return errorResponse(error.message || "Failed to update service", 500);
  }
}

// DELETE /api/services/[id] - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require salonId for multi-tenant isolation
    const salonId = await requireSalonId(request);

    // Verify service belongs to current salon
    await verifySalonAccess(salonId, "service", params.id);

    await prisma.service.update({
      where: { id: params.id },
      data: {
        isActive: false,
      },
    });

    return successResponse(null, "Service deactivated successfully");
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 401) {
      return errorResponse(error.message || "Service not found", error.statusCode);
    }
    if (error.code === "P2025") {
      return errorResponse("Service not found", 404);
    }
    return errorResponse(error.message || "Failed to deactivate service", 500);
  }
}

