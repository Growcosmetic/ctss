import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/customers/[id] - Get customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          take: 5,
          orderBy: { date: "desc" },
        },
        invoices: {
          take: 5,
          orderBy: { date: "desc" },
        },
      },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    return successResponse(customer);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch customer", 500);
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      province,
      postalCode,
      notes,
      status,
    } = body;

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: `${firstName || ""} ${lastName || ""}`.trim() || undefined,
        phone,
        birthday: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        notes,
      },
    });

    return successResponse(customer, "Customer updated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Customer not found", 404);
    }
    if (error.code === "P2002") {
      return errorResponse("Email or phone already exists", 409);
    }
    return errorResponse(error.message || "Failed to update customer", 500);
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.customer.delete({
      where: { id: params.id },
    });

    return successResponse(null, "Customer deleted successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Customer not found", 404);
    }
    return errorResponse(error.message || "Failed to delete customer", 500);
  }
}

