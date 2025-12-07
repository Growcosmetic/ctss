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

// GET /api/branches
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        staff: {
          include: {
            branchStaff: {
              include: {
                branch: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Admin sees all branches
    if (user.role === "ADMIN") {
      const branches = await prisma.branch.findMany({
        where: { isActive: true },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });
      return successResponse(branches);
    }

    // Manager sees only their branch
    if (user.role === "MANAGER") {
      const branch = await prisma.branch.findFirst({
        where: {
          managerId: userId,
          isActive: true,
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return successResponse(branch ? [branch] : []);
    }

    // Receptionist sees branches they work in
    if (user.role === "RECEPTIONIST" && user.staff) {
      const branchIds = user.staff.branchStaff.map((bs) => bs.branchId);
      const branches = await prisma.branch.findMany({
        where: {
          id: { in: branchIds },
          isActive: true,
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });
      return successResponse(branches);
    }

    // Others see no branches
    return successResponse([]);
  } catch (error: any) {
    // Fallback to mock data if database is not available
    if (error.message?.includes("denied access") || 
        error.message?.includes("ECONNREFUSED") ||
        error.code === "P1001") {
      console.warn("Database connection failed, using mock branches:", error.message);
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;
      const userId = token ? validateToken(token) : null;
      
      // Return mock branch for admin
      if (userId && userId.includes("admin")) {
        return successResponse([
          {
            id: "mock-branch-1",
            name: "Chi nhánh Quận 1",
            address: "123 Nguyễn Huệ, Q1, TP.HCM",
            phone: "0900000001",
            email: "q1@ctss.com",
            isActive: true,
            managerId: null,
            manager: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
      
      // Return empty array for others
      return successResponse([]);
    }
    console.error("Error fetching branches:", error);
    return errorResponse(error.message || "Failed to fetch branches", 500);
  }
}

// POST /api/branches
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return errorResponse("Only admin can create branches", 403);
    }

    const body = await request.json();
    const { name, address, phone, email, managerId } = body;

    if (!name) {
      return errorResponse("Branch name is required", 400);
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        phone,
        email,
        managerId,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse(branch, "Branch created successfully", 201);
  } catch (error: any) {
    console.error("Error creating branch:", error);
    return errorResponse(error.message || "Failed to create branch", 500);
  }
}

