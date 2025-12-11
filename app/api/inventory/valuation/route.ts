import { NextRequest } from "next/server";
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

// GET /api/inventory/valuation - Calculate total inventory value
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

    if (!branchId) {
      return errorResponse("Branch ID is required", 400);
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

    try {
      // Get all stocks for the branch with product costPrice
      const stocks = await prisma.productStock.findMany({
        where: { branchId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              costPrice: true,
              pricePerUnit: true,
              unit: true,
              category: true,
            },
          },
        },
      });

      // Calculate total value by costPrice
      let totalValueByCost = 0;
      let totalValueByPrice = 0;
      const items: any[] = [];

      for (const stock of stocks) {
        const quantity = Number(stock.quantity);
        const costPrice = stock.product.costPrice || 0;
        const pricePerUnit = stock.product.pricePerUnit || 0;
        
        const valueByCost = quantity * costPrice;
        const valueByPrice = quantity * pricePerUnit;

        totalValueByCost += valueByCost;
        totalValueByPrice += valueByPrice;

        items.push({
          productId: stock.product.id,
          productName: stock.product.name,
          category: stock.product.category,
          unit: stock.product.unit,
          quantity,
          costPrice,
          pricePerUnit,
          valueByCost,
          valueByPrice,
        });
      }

      // Group by category
      const byCategory: Record<string, { count: number; valueByCost: number; valueByPrice: number }> = {};
      for (const item of items) {
        if (!byCategory[item.category]) {
          byCategory[item.category] = { count: 0, valueByCost: 0, valueByPrice: 0 };
        }
        byCategory[item.category].count += 1;
        byCategory[item.category].valueByCost += item.valueByCost;
        byCategory[item.category].valueByPrice += item.valueByPrice;
      }

      return successResponse({
        branchId,
        totalItems: stocks.length,
        totalValueByCost, // Tổng giá trị theo giá vốn
        totalValueByPrice, // Tổng giá trị theo giá bán
        estimatedProfit: totalValueByPrice - totalValueByCost, // Lợi nhuận ước tính
        byCategory,
        items: items.sort((a, b) => b.valueByCost - a.valueByCost), // Sort by value descending
        calculatedAt: new Date().toISOString(),
      });
    } catch (dbError: any) {
      if (dbError.message?.includes("denied access") || 
          dbError.message?.includes("ECONNREFUSED") ||
          dbError.code === "P1001") {
        console.warn("Database connection failed, returning empty valuation:", dbError.message);
        return successResponse({
          branchId,
          totalItems: 0,
          totalValueByCost: 0,
          totalValueByPrice: 0,
          estimatedProfit: 0,
          byCategory: {},
          items: [],
          calculatedAt: new Date().toISOString(),
        });
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error calculating valuation:", error);
    return errorResponse(error.message || "Failed to calculate inventory valuation", 500);
  }
}
