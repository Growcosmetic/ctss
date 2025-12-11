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
        include: {
          supplier: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
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
    const {
      name,
      sku,
      category,
      subCategory,
      unit,
      capacity,
      capacityUnit,
      pricePerUnit,
      costPrice,
      minStock,
      maxStock,
      supplierId,
      brand,
      notes,
      isActive,
    } = body;

    // Validate required fields
    if (!name || !category || !unit) {
      return errorResponse("Tên sản phẩm, nhóm sản phẩm và đơn vị tính là bắt buộc", 400);
    }

    // Generate SKU if not provided
    let finalSku = sku;
    if (!finalSku || finalSku.trim() === "") {
      // Generate SKU from name and timestamp
      const namePrefix = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 6);
      const timestamp = Date.now().toString().slice(-6);
      finalSku = `${namePrefix}${timestamp}`;
    }

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: finalSku.trim().toUpperCase() },
    });

    if (existingSku) {
      return errorResponse("Mã SKU đã tồn tại", 409);
    }

    // Build notes (include brand if provided)
    const skuNote = brand ? `Thương hiệu: ${brand}\n${notes || ""}`.trim() : (notes || "");

    const product = await prisma.product.create({
      data: {
        name,
        sku: finalSku.trim().toUpperCase(),
        category,
        subCategory: subCategory || null,
        unit,
        capacity: capacity ? parseFloat(capacity.toString()) : null,
        capacityUnit: capacityUnit || null,
        pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit.toString()) : null,
        costPrice: costPrice ? parseFloat(costPrice.toString()) : null,
        minStock: minStock ? parseFloat(minStock.toString()) : null,
        maxStock: maxStock ? parseFloat(maxStock.toString()) : null,
        supplierId: supplierId || null,
        isActive: isActive !== undefined ? isActive : true,
        notes: skuNote || null,
        branchAware: true,
      },
    });

    return successResponse(product, "Sản phẩm đã được tạo thành công", 201);
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.code === "P2002") {
      return errorResponse("Sản phẩm đã tồn tại", 409);
    }
    return errorResponse(error.message || "Không thể tạo sản phẩm", 500);
  }
}

