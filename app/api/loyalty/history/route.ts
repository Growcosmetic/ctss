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

// GET /api/loyalty/history?customerId=xxx
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
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    const pointsHistory = await prisma.loyaltyPoint.findMany({
      where: { customerId },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return successResponse(pointsHistory);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to get points history", 500);
  }
}

