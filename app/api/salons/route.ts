import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentSalonId } from "@/lib/api-helpers";

// GET /api/salons - Get current user's salon
export async function GET(request: NextRequest) {
  try {
    const salonId = await getCurrentSalonId(request);
    
    if (!salonId) {
      return errorResponse("Salon not found", 404);
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
      },
    });

    if (!salon) {
      return errorResponse("Salon not found", 404);
    }

    return successResponse(salon);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get salon", 500);
  }
}

