import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/services/[id] - Get service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        staffServices: {
          include: {
            staff: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!service) {
      return errorResponse("Service not found", 404);
    }

    return successResponse(service);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch service", 500);
  }
}

// PUT /api/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      categoryId,
      name,
      description,
      duration,
      price,
      cost,
      image,
      isActive,
      sortOrder,
    } = body;

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        categoryId,
        name,
        description,
        duration: duration ? parseInt(duration) : undefined,
        price: price ? parseFloat(price) : undefined,
        cost: cost !== undefined ? (cost ? parseFloat(cost) : null) : undefined,
        image,
        isActive,
        sortOrder,
      },
      include: {
        category: true,
      },
    });

    return successResponse(service, "Service updated successfully");
  } catch (error: any) {
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
    await prisma.service.update({
      where: { id: params.id },
      data: {
        isActive: false,
      },
    });

    return successResponse(null, "Service deactivated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Service not found", 404);
    }
    return errorResponse(error.message || "Failed to deactivate service", 500);
  }
}

