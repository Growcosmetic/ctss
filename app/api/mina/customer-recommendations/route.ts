import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { suggestServices } from "@/features/mina/services/minaEngine";

// Simple token validation
function validateCustomerToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [customerId] = decoded.split(":");
    return customerId || null;
  } catch {
    return null;
  }
}

// GET /api/mina/customer-recommendations
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const customerId = validateCustomerToken(token);
    if (!customerId) {
      return errorResponse("Invalid token", 401);
    }

    // Get service suggestions from Mina
    const suggestions = await suggestServices(customerId);

    // Format for customer app
    const recommendations = suggestions.map((suggestion) => ({
      serviceId: suggestion.serviceId,
      serviceName: suggestion.serviceName,
      reason: suggestion.reason,
      priority: suggestion.priority || "MEDIUM",
    }));

    return successResponse(recommendations);
  } catch (error: any) {
    console.error("Error getting customer recommendations:", error);
    return errorResponse(
      error.message || "Failed to get recommendations",
      500
    );
  }
}

