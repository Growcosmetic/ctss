import { NextRequest } from "next/server";
import { calculateTier } from "@/features/loyalty/services/loyaltyEngine";
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

// POST /api/loyalty/update-tier (Internal)
export async function POST(request: NextRequest) {
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

    // Check if user is admin or manager
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return errorResponse("Unauthorized", 403);
    }

    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    const newTierId = await calculateTier(customerId);

    if (newTierId) {
      await prisma.customerLoyalty.update({
        where: { customerId },
        data: { tierId: newTierId },
      });
    }

    return successResponse({ tierId: newTierId }, "Tier updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update tier", 500);
  }
}

