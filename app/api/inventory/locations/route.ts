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

// GET /api/inventory/locations - Get all locations for a branch
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
      const locations = await prisma.location.findMany({
        where: {
          branchId,
          isActive: true,
        },
        orderBy: [
          { zone: "asc" },
          { rack: "asc" },
          { shelf: "asc" },
          { bin: "asc" },
        ],
      });

      return successResponse(locations);
    } catch (dbError: any) {
      if (dbError.message?.includes("denied access") || 
          dbError.message?.includes("ECONNREFUSED") ||
          dbError.code === "P1001") {
        console.warn("Database connection failed, returning empty locations:", dbError.message);
        return successResponse([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error fetching locations:", error);
    return errorResponse(error.message || "Failed to fetch locations", 500);
  }
}

// POST /api/inventory/locations - Create a new location
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
    const { branchId, code, zone, rack, shelf, bin, description, capacity } = body;

    // Validate required fields
    if (!branchId || !code) {
      return errorResponse("Branch ID and Location code are required", 400);
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

    // Manager can only create locations for their branch
    if (user.role === "MANAGER") {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch || branch.managerId !== userId) {
        return errorResponse("Access denied", 403);
      }
    }

    // Check if location code already exists for this branch
    const existing = await prisma.location.findFirst({
      where: {
        branchId,
        code: code.toUpperCase().trim(),
      },
    });

    if (existing) {
      return errorResponse("Location code already exists for this branch", 409);
    }

    const location = await prisma.location.create({
      data: {
        branchId,
        code: code.toUpperCase().trim(),
        zone: zone?.trim() || null,
        rack: rack?.trim() || null,
        shelf: shelf?.trim() || null,
        bin: bin?.trim() || null,
        description: description?.trim() || null,
        capacity: capacity ? parseInt(capacity.toString()) : null,
        isActive: true,
      },
    });

    return successResponse(location, "Location created successfully", 201);
  } catch (error: any) {
    console.error("Error creating location:", error);
    if (error.code === "P2002") {
      return errorResponse("Location code already exists", 409);
    }
    return errorResponse(error.message || "Failed to create location", 500);
  }
}
