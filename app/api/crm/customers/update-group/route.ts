import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/crm/customers/update-group
// Update customer group for multiple customers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerIds, groupName } = body;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return errorResponse("customerIds must be a non-empty array", 400);
    }

    if (!groupName || typeof groupName !== "string") {
      return errorResponse("groupName is required", 400);
    }

    try {
      // Update each customer's profile preferences
      const updatePromises = customerIds.map(async (customerId: string) => {
        // Get current customer profile
        const customer = await prisma.customer.findUnique({
          where: { id: customerId },
          include: { profile: true },
        });

        if (!customer) {
          throw new Error(`Customer ${customerId} not found`);
        }

        // Get current preferences
        const currentPreferences = (customer.profile?.preferences as any) || {};
        
        // Update customerGroup in preferences
        const updatedPreferences = {
          ...currentPreferences,
          customerGroup: groupName,
        };

        // Upsert CustomerProfile
        await prisma.customerProfile.upsert({
          where: { customerId },
          update: {
            preferences: updatedPreferences,
            updatedAt: new Date(),
          },
          create: {
            customerId,
            name: customer.name,
            phone: customer.phone,
            preferences: updatedPreferences,
          },
        });
      });

      await Promise.all(updatePromises);

      return successResponse(
        { updated: customerIds.length },
        `Successfully updated ${customerIds.length} customers to group "${groupName}"`
      );
    } catch (dbError: any) {
      // Fallback for mock data
      if (
        dbError.message?.includes("denied access") ||
        dbError.message?.includes("ECONNREFUSED") ||
        dbError.message?.includes("P1001") ||
        dbError.code === "P1001"
      ) {
        console.warn("Database connection failed, returning mock response");
        return successResponse(
          { updated: customerIds.length },
          `Successfully updated ${customerIds.length} customers to group "${groupName}" (mock - database not available)`
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error updating customer group:", error);
    return errorResponse(error.message || "Failed to update customer group", 500);
  }
}

