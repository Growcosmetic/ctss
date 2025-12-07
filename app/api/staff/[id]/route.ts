import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/staff/[id] - Get staff by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        staffServices: {
          include: {
            service: true,
          },
        },
        shifts: {
          take: 10,
          orderBy: { date: "desc" },
        },
      },
    });

    if (!staff) {
      return errorResponse("Staff not found", 404);
    }

    return successResponse(staff);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch staff", 500);
  }
}

// PUT /api/staff/[id] - Update staff
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      position,
      hireDate,
      salary,
      commissionRate,
      specialization,
      isActive,
    } = body;

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: {
        position,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        salary: salary ? parseFloat(salary) : undefined,
        commissionRate: commissionRate ? parseFloat(commissionRate) : undefined,
        specialization,
        isActive,
      },
      include: {
        user: true,
      },
    });

    return successResponse(staff, "Staff updated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Staff not found", 404);
    }
    return errorResponse(error.message || "Failed to update staff", 500);
  }
}

// DELETE /api/staff/[id] - Delete staff
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.staff.update({
      where: { id: params.id },
      data: {
        isActive: false,
      },
    });

    return successResponse(null, "Staff deactivated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Staff not found", 404);
    }
    return errorResponse(error.message || "Failed to deactivate staff", 500);
  }
}

