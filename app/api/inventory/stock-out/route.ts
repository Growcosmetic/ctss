import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { removeStock } from "@/features/inventory/services/inventoryEngine";

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

// POST /api/inventory/stock-out
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

    const body = await request.json();
    const { productId, branchId, quantity, reason, reference, notes } = body;

    if (!productId || !branchId || !quantity || quantity <= 0) {
      return errorResponse("Product ID, Branch ID, and valid quantity are required", 400);
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER" && user.role !== "RECEPTIONIST") {
      return errorResponse("Access denied", 403);
    }

    // Manager/Receptionist can only access their branch
    if (user.role === "MANAGER" || user.role === "RECEPTIONIST") {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch) {
        return errorResponse("Branch not found", 404);
      }

      if (user.role === "MANAGER" && branch.managerId !== userId) {
        return errorResponse("Access denied", 403);
      }

      // Receptionist check (would need branchStaff relation)
    }

    await removeStock(productId, branchId, quantity, userId, reason, reference, notes);

    return successResponse(null, "Stock removed successfully");
  } catch (error: any) {
    console.error("Error removing stock:", error);
    return errorResponse(error.message || "Failed to remove stock", 500);
  }
}

