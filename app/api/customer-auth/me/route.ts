import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

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

// GET /api/customer-auth/me
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

    // Get customer info
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        loyalty: {
          include: {
            tier: true,
          },
        },
      },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    return successResponse({
      customer,
      loyalty: customer.loyalty,
    });
  } catch (error: any) {
    console.error("Error getting customer info:", error);
    return errorResponse(error.message || "Failed to get customer info", 500);
  }
}

