import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { predictStockOut } from "@/features/inventory/services/inventoryAI";

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

// GET /api/inventory/forecast
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const branchId = searchParams.get("branchId");

    if (!productId || !branchId) {
      return errorResponse("Product ID and Branch ID are required", 400);
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

    const forecast = await predictStockOut(productId, branchId);

    return successResponse(forecast);
  } catch (error: any) {
    console.error("Error fetching forecast:", error);
    return errorResponse(error.message || "Failed to fetch forecast", 500);
  }
}

