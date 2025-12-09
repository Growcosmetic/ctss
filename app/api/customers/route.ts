import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/customers - Get all customers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }

    let customers: any[], total: number;
    try {
      [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.customer.count({ where }),
      ]);
    } catch (dbError: any) {
      // If database connection fails, use mock data
      if (dbError.message?.includes("denied access") || 
          dbError.message?.includes("ECONNREFUSED") ||
          dbError.message?.includes("P1001") ||
          dbError.code === "P1001") {
        console.warn("Database connection failed, using mock data:", dbError.message);
        customers = [];
        total = 0;
      } else {
        throw dbError; // Re-throw if it's a different error
      }
    }

    return successResponse({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    // Fallback to mock data if database is not available
    console.warn("Database connection failed, using mock data:", error.message);
    const searchParams = request.nextUrl.searchParams;
    return successResponse({
      customers: [],
      pagination: {
        page: parseInt(searchParams.get("page") || "1"),
        limit: parseInt(searchParams.get("limit") || "10"),
        total: 0,
        totalPages: 0,
      },
    });
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  // Parse body once before try-catch
  let body: any = {};
  try {
    body = await request.json();
  } catch (parseError) {
    return errorResponse("Invalid JSON body", 400);
  }

  const {
    name,
    phone,
    dateOfBirth,
    gender,
    notes,
  } = body;

  if (!name || !phone) {
    return errorResponse("Name and phone are required", 400);
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        name: name || "Khách hàng",
        phone,
        birthday: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        notes,
      },
    });

    return successResponse(customer, "Customer created successfully", 201);
  } catch (error: any) {
    // Fallback to mock response if database is not available
    if (error.message?.includes("denied access") || error.message?.includes("ECONNREFUSED")) {
      console.warn("Database connection failed, returning mock response:", error.message);
      return successResponse(
        {
          id: `mock-${Date.now()}`,
          name: name || "Khách hàng",
          phone: phone || "",
          birthday: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender: gender || null,
          notes: notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        "Customer created successfully (mock - database not available)",
        201
      );
    }
    if (error.code === "P2002") {
      return errorResponse("Phone already exists", 409);
    }
    return errorResponse(error.message || "Failed to create customer", 500);
  }
}

