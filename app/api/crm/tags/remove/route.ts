import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/crm/tags/remove
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, tagId } = body;

    if (!customerId || !tagId) {
      return errorResponse("customerId and tagId are required", 400);
    }

    // Check if tag exists and belongs to customer
    const tag = await prisma.customerTag.findFirst({
      where: {
        id: tagId,
        customerId,
      },
    });

    if (!tag) {
      return errorResponse("Tag not found", 404);
    }

    await prisma.customerTag.delete({
      where: { id: tagId },
    });

    return successResponse(null, "Tag removed successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to remove tag", 500);
  }
}

