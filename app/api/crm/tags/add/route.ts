import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/crm/tags/add
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, label, color } = body;

    if (!customerId || !label) {
      return errorResponse("customerId and label are required", 400);
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    // Check if tag with same label already exists for this customer
    const existing = await prisma.customerTag.findFirst({
      where: {
        customerId,
        tag: label,
      },
    });

    if (existing) {
      return errorResponse("Tag with this label already exists", 400);
    }

    const tag = await prisma.customerTag.create({
      data: {
        customerId,
        tag: label,
      },
    });

    return successResponse(tag, "Tag added successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to add tag", 500);
  }
}

