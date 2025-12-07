import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { addStock } from "@/features/inventory/services/inventoryEngine";

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

// POST /api/inventory/stock-in
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
    const { productId, branchId, quantity, reason, notes } = body;

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

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return errorResponse("Access denied", 403);
    }

    // Manager can only access their branch
    if (user.role === "MANAGER") {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch || branch.managerId !== userId) {
        return errorResponse("Access denied", 403);
      }
    }

    await addStock(productId, branchId, quantity, userId, reason, notes);

    return successResponse(null, "Stock added successfully");
  } catch (error: any) {
    console.error("Error adding stock:", error);
    return errorResponse(error.message || "Failed to add stock", 500);
  }
}

