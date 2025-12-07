import { NextRequest } from "next/server";
import { redeemPoints } from "@/features/loyalty/services/loyaltyEngine";
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

// POST /api/loyalty/redeem
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
    const { customerId, points, description } = body;

    if (!customerId || !points) {
      return errorResponse("customerId and points are required", 400);
    }

    if (points <= 0) {
      return errorResponse("Points must be greater than 0", 400);
    }

    await redeemPoints(customerId, points, description);

    return successResponse(null, "Points redeemed successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to redeem points", 500);
  }
}

