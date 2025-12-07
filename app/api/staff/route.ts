import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/staff
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const simple = searchParams.get("simple") === "true";

    if (simple) {
      // Simplified response for customer app
      const staff = await prisma.staff.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const formattedStaff = staff.map((s) => ({
        id: s.id,
        name: `${s.user.firstName} ${s.user.lastName}`,
      }));

      return successResponse(formattedStaff);
    }

    // Full response (existing logic)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const [staff, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.staff.count({ where }),
    ]);

    return successResponse({
      staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching staff:", error);
    return errorResponse(error.message || "Failed to fetch staff", 500);
  }
}
