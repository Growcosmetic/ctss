import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import { addStock, removeStock } from "@/features/inventory/services/inventoryEngine";

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

// GET /api/inventory/transfer/[id] - Get transfer detail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                category: true,
              },
            },
          },
        },
        fromBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        toBranch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!transfer) {
      return errorResponse("Phiếu chuyển kho không tồn tại", 404);
    }

    return successResponse(transfer);
  } catch (error: any) {
    console.error("Error fetching transfer:", error);
    return errorResponse(error.message || "Failed to fetch transfer", 500);
  }
}

// PUT /api/inventory/transfer/[id]/complete - Complete transfer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get transfer
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        fromBranch: true,
        toBranch: true,
      },
    });

    if (!transfer) {
      return errorResponse("Phiếu chuyển kho không tồn tại", 404);
    }

    if (transfer.status !== "PENDING") {
      return errorResponse(`Phiếu chuyển kho đã ở trạng thái ${transfer.status}`, 400);
    }

    // Manager can only complete transfers to their branch
    if (user.role === "MANAGER") {
      if (transfer.toBranch.managerId !== userId) {
        return errorResponse("Bạn chỉ có thể hoàn thành chuyển kho đến chi nhánh của mình", 403);
      }
    }

    // Process each item: OUT from source, IN to destination
    for (const item of transfer.items) {
      try {
        // Remove from source branch
        await removeStock(
          item.productId,
          transfer.fromBranchId,
          item.quantity,
          userId,
          "transfer",
          transfer.id
        );

        // Add to destination branch
        await addStock(
          item.productId,
          transfer.toBranchId,
          item.quantity,
          userId,
          "transfer",
          `Chuyển từ ${transfer.fromBranch.name}`
        );
      } catch (error: any) {
        console.error(`Error transferring item ${item.productId}:`, error);
        throw new Error(`Không thể chuyển sản phẩm ${item.product.name}: ${error.message}`);
      }
    }

    // Update transfer status
    const updatedTransfer = await prisma.stockTransfer.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        completedBy: userId,
        completedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        fromBranch: {
          select: {
            id: true,
            name: true,
          },
        },
        toBranch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(updatedTransfer, "Chuyển kho đã được hoàn thành thành công");
  } catch (error: any) {
    console.error("Error completing transfer:", error);
    return errorResponse(error.message || "Không thể hoàn thành chuyển kho", 500);
  }
}

// DELETE /api/inventory/transfer/[id] - Cancel transfer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get transfer
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: params.id },
      include: {
        fromBranch: true,
      },
    });

    if (!transfer) {
      return errorResponse("Phiếu chuyển kho không tồn tại", 404);
    }

    if (transfer.status !== "PENDING") {
      return errorResponse("Chỉ có thể hủy phiếu chuyển kho ở trạng thái PENDING", 400);
    }

    // Manager can only cancel transfers from their branch
    if (user.role === "MANAGER") {
      if (transfer.fromBranch.managerId !== userId) {
        return errorResponse("Bạn chỉ có thể hủy chuyển kho từ chi nhánh của mình", 403);
      }
    }

    // Update status to CANCELLED
    const cancelledTransfer = await prisma.stockTransfer.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
      },
    });

    return successResponse(cancelledTransfer, "Phiếu chuyển kho đã được hủy thành công");
  } catch (error: any) {
    console.error("Error cancelling transfer:", error);
    return errorResponse(error.message || "Không thể hủy phiếu chuyển kho", 500);
  }
}
