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

// GET /api/inventory/suppliers - Get all suppliers
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
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    try {
      const suppliers = await prisma.supplier.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return successResponse(suppliers);
    } catch (dbError: any) {
      if (dbError.message?.includes("denied access") || 
          dbError.message?.includes("ECONNREFUSED") ||
          dbError.code === "P1001") {
        console.warn("Database connection failed, returning empty suppliers:", dbError.message);
        return successResponse([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error fetching suppliers:", error);
    return errorResponse(error.message || "Failed to fetch suppliers", 500);
  }
}

// POST /api/inventory/suppliers - Create a new supplier
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

    // Check permissions (only Admin and Manager)
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
    const {
      code,
      name,
      contactName,
      phone,
      email,
      address,
      city,
      province,
      country,
      taxCode,
      website,
      paymentTerms,
      notes,
    } = body;

    // Validate required fields
    if (!name) {
      return errorResponse("Tên nhà cung cấp là bắt buộc", 400);
    }

    // Generate code if not provided
    let finalCode = code;
    if (!finalCode || finalCode.trim() === "") {
      const namePrefix = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 6);
      const timestamp = Date.now().toString().slice(-6);
      finalCode = `NCC${namePrefix}${timestamp}`;
    }

    // Check if code already exists
    const existing = await prisma.supplier.findUnique({
      where: { code: finalCode.toUpperCase().trim() },
    });

    if (existing) {
      return errorResponse("Mã nhà cung cấp đã tồn tại", 409);
    }

    const supplier = await prisma.supplier.create({
      data: {
        code: finalCode.toUpperCase().trim(),
        name: name.trim(),
        contactName: contactName?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        province: province?.trim() || null,
        country: country?.trim() || "VN",
        taxCode: taxCode?.trim() || null,
        website: website?.trim() || null,
        paymentTerms: paymentTerms?.trim() || null,
        notes: notes?.trim() || null,
        isActive: true,
      },
    });

    return successResponse(supplier, "Nhà cung cấp đã được tạo thành công", 201);
  } catch (error: any) {
    console.error("Error creating supplier:", error);
    if (error.code === "P2002") {
      return errorResponse("Mã nhà cung cấp đã tồn tại", 409);
    }
    return errorResponse(error.message || "Không thể tạo nhà cung cấp", 500);
  }
}
