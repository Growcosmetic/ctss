import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

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

// GET /api/staff
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

    const searchParams = request.nextUrl.searchParams;
    const simple = searchParams.get("simple") === "true";

    if (simple) {
      // Simplified response for customer app
      const staff = await prisma.staff.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      });

      const formattedStaff = staff.map((s) => ({
        id: s.id,
        name: s.user.name,
        phone: s.user.phone,
      }));

      return successResponse(formattedStaff);
    }

    // Full response (existing logic)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const role = searchParams.get("role");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }
    if (role) {
      where.user = {
        role: role,
      };
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
              name: true,
              phone: true,
              role: true,
              branchId: true,
              createdAt: true,
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

// POST /api/staff - Create new staff
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
    const {
      name,
      phone,
      password,
      role, // STYLIST | ASSISTANT | RECEPTIONIST
      branchId,
      employeeId,
      position,
      hireDate,
      salary,
      commissionRate,
      specialization,
      serviceIds, // Array of service IDs
    } = body;

    // Validate required fields
    if (!name || !phone || !password || !role) {
      return errorResponse("name, phone, password, và role là bắt buộc", 400);
    }

    // Validate role
    const validRoles = ["STYLIST", "ASSISTANT", "RECEPTIONIST"];
    if (!validRoles.includes(role)) {
      return errorResponse(`role phải là một trong: ${validRoles.join(", ")}`, 400);
    }

    // Check if phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return errorResponse("Số điện thoại đã được sử dụng", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate employee ID if not provided
    let finalEmployeeId = employeeId;
    if (!finalEmployeeId) {
      const count = await prisma.staff.count();
      finalEmployeeId = `NV${String(count + 1).padStart(4, "0")}`;
    } else {
      // Check if employeeId already exists
      const existingStaff = await prisma.staff.findUnique({
        where: { employeeId: finalEmployeeId },
      });
      if (existingStaff) {
        return errorResponse("Mã nhân viên đã tồn tại", 400);
      }
    }

    // Create user and staff in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          phone,
          password: hashedPassword,
          role,
          branchId: branchId || null,
        },
      });

      // Create staff
      const newStaff = await tx.staff.create({
        data: {
          userId: newUser.id,
          employeeId: finalEmployeeId,
          position: position || null,
          hireDate: hireDate ? new Date(hireDate) : null,
          salary: salary ? parseFloat(salary) : null,
          commissionRate: commissionRate ? parseFloat(commissionRate) : null,
          specialization: specialization || null,
          isActive: true,
        },
      });

      // Create staff services if provided
      if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
        await tx.staffService.createMany({
          data: serviceIds.map((serviceId: string) => ({
            staffId: newStaff.id,
            serviceId,
          })),
        });
      }

      // Return with user data
      return await tx.staff.findUnique({
        where: { id: newStaff.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              role: true,
              branchId: true,
              createdAt: true,
            },
          },
          staffServices: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });

    return successResponse(result, "Tạo nhân viên thành công");
  } catch (error: any) {
    console.error("Error creating staff:", error);
    if (error.code === "P2002") {
      return errorResponse("Số điện thoại hoặc mã nhân viên đã tồn tại", 400);
    }
    return errorResponse(error.message || "Failed to create staff", 500);
  }
}
