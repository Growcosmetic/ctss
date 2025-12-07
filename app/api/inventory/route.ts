import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/inventory - Get all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const lowStock = searchParams.get("lowStock") === "true";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    if (lowStock) {
      where.stockQuantity = { lte: prisma.product.fields.minStockLevel };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
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
  } catch (error: any) {
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

