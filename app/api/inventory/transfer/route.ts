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

// POST /api/inventory/transfer - Create stock transfer
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

    const body = await request.json();
    const { fromBranchId, toBranchId, items, notes } = body;

    if (!fromBranchId || !toBranchId || !items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("fromBranchId, toBranchId, and items are required", 400);
    }

    if (fromBranchId === toBranchId) {
      return errorResponse("Không thể chuyển kho trong cùng một chi nhánh", 400);
    }

    // Validate branches exist
    const [fromBranch, toBranch] = await Promise.all([
      prisma.branch.findUnique({ where: { id: fromBranchId } }),
      prisma.branch.findUnique({ where: { id: toBranchId } }),
    ]);

    if (!fromBranch || !toBranch) {
      return errorResponse("Chi nhánh không tồn tại", 404);
    }

    // Manager can only transfer from their branch
    if (user.role === "MANAGER") {
      if (fromBranch.managerId !== userId) {
        return errorResponse("Bạn chỉ có thể chuyển kho từ chi nhánh của mình", 403);
      }
    }

    // Generate transfer number
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const count = await prisma.stockTransfer.count({
      where: {
        transferNumber: {
          startsWith: `CK-${year}-${month}`,
        },
      },
    });
    const transferNumber = `CK-${year}-${month}-${String(count + 1).padStart(3, "0")}`;

    // Validate stock availability for all items
    for (const item of items) {
      const { productId, quantity } = item;
      
      if (!productId || !quantity || quantity <= 0) {
        return errorResponse("Mỗi sản phẩm phải có productId và quantity > 0", 400);
      }

      // Check stock in fromBranch
      const stock = await prisma.productStock.findFirst({
        where: {
          productId,
          branchId: fromBranchId,
        },
      });

      if (!stock || Number(stock.quantity) < quantity) {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { name: true },
        });
        return errorResponse(
          `Không đủ tồn kho cho sản phẩm "${product?.name || productId}". Tồn kho hiện tại: ${stock?.quantity || 0}`,
          400
        );
      }

      // Get cost price
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { costPrice: true },
      });
      item.costPrice = product?.costPrice || null;
    }

    // Create transfer record
    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber,
        fromBranchId,
        toBranchId,
        createdBy: userId,
        notes: notes || null,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            costPrice: item.costPrice,
            notes: item.notes || null,
          })),
        },
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

    return successResponse(transfer, "Phiếu chuyển kho đã được tạo thành công", 201);
  } catch (error: any) {
    console.error("Error creating transfer:", error);
    return errorResponse(error.message || "Không thể tạo phiếu chuyển kho", 500);
  }
}

// GET /api/inventory/transfer - List stock transfers
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
    const branchId = searchParams.get("branchId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

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

    const where: any = {};

    // Manager can only see transfers involving their branch
    if (user.role === "MANAGER" && user.branchId) {
      where.OR = [
        { fromBranchId: user.branchId },
        { toBranchId: user.branchId },
      ];
    } else if (branchId) {
      where.OR = [
        { fromBranchId: branchId },
        { toBranchId: branchId },
      ];
    }

    if (status) {
      where.status = status;
    }

    const transfers = await prisma.stockTransfer.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return successResponse(transfers);
  } catch (error: any) {
    console.error("Error fetching transfers:", error);
    return errorResponse(error.message || "Failed to fetch transfers", 500);
  }
}
