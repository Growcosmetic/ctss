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

// GET /api/inventory - Get all products
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const category = searchParams.get("category");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Filter by category (string field, not relation)
    if (category) {
      where.category = category;
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    try {
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: "asc" },
        }),
        prisma.product.count({ where }),
      ]);

      return successResponse({
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (dbError: any) {
      // Fallback to empty array if database fails
      if (dbError.message?.includes("denied access") || 
          dbError.message?.includes("ECONNREFUSED") ||
          dbError.code === "P1001") {
        console.warn("Database connection failed, returning empty products:", dbError.message);
        return successResponse({
          products: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return errorResponse(error.message || "Failed to fetch products", 500);
  }
}

// POST /api/inventory - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categoryId,
      name,
      sku,
      description,
      cost,
      price,
      stockQuantity,
      minStockLevel,
      unit,
      image,
    } = body;

    if (!categoryId || !name || !sku || !cost || !price) {
      return errorResponse("Category, name, SKU, cost, and price are required", 400);
    }

    const product = await prisma.product.create({
      data: {
        categoryId,
        name,
        sku,
        description,
        cost: parseFloat(cost),
        price: parseFloat(price),
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
        minStockLevel: minStockLevel ? parseInt(minStockLevel) : 0,
        unit: unit || "pcs",
        image,
      },
      include: {
        category: true,
      },
    });

    return successResponse(product, "Product created successfully", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return errorResponse("SKU already exists", 409);
    }
    return errorResponse(error.message || "Failed to create product", 500);
  }
}

