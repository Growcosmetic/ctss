import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/crm/groups - Get all customer groups
export async function GET(request: NextRequest) {
  try {
    try {
      // Get all customers (we'll filter in memory to avoid Prisma query issues)
      const allCustomers = await prisma.customer.findMany({
        include: { profile: true },
      });

      const groupMap = new Map<string, number>();
      
      // Count customers in each group (excluding placeholder customers)
      allCustomers.forEach((customer) => {
        // Skip placeholder customers
        const isPlaceholder = customer.phone?.startsWith("GROUP_") || 
                              customer.status === "INACTIVE" ||
                              (customer.profile?.preferences as any)?.isGroupPlaceholder === true;
        
        if (isPlaceholder) {
          // This is a placeholder - extract group name for empty groups
          const groupName = (customer.profile?.preferences as any)?.customerGroup;
          if (groupName && !groupMap.has(groupName)) {
            groupMap.set(groupName, 0); // Empty group
          }
          return;
        }
        
        // Real customer - count in group
        const groupName = (customer.profile?.preferences as any)?.customerGroup || "Chưa phân nhóm";
        groupMap.set(groupName, (groupMap.get(groupName) || 0) + 1);
      });

      const groups = Array.from(groupMap.entries()).map(([name, count]) => ({
        name,
        customerCount: count,
      }));

      return successResponse(groups);
    } catch (dbError: any) {
      // Fallback for mock data
      if (
        dbError.message?.includes("denied access") ||
        dbError.message?.includes("ECONNREFUSED") ||
        dbError.message?.includes("P1001") ||
        dbError.code === "P1001"
      ) {
        console.warn("Database connection failed, using mock groups");
        return successResponse([
          { name: "VIP", customerCount: 3 },
          { name: "Facebook", customerCount: 3 },
          { name: "Zalo", customerCount: 2 },
          { name: "Website", customerCount: 1 },
        ]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error fetching groups:", error);
    return errorResponse(error.message || "Failed to fetch groups", 500);
  }
}

// POST /api/crm/groups - Create a new group (by creating a placeholder customer or storing in a config)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupName } = body;

    if (!groupName || typeof groupName !== "string" || !groupName.trim()) {
      return errorResponse("groupName is required and must be a non-empty string", 400);
    }

    // Since we don't have a CustomerGroup table, we'll create a placeholder customer
    // with this group so it persists. This customer can be filtered out in queries.
    try {
      const placeholderPhone = `GROUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Check if group already exists by checking if there's any customer with this group
      const existingCustomers = await prisma.customer.findMany({
        include: { profile: true },
      });

      const groupExists = existingCustomers.some((c) => {
        const group = (c.profile?.preferences as any)?.customerGroup;
        return group === groupName.trim();
      });

      if (groupExists) {
        return errorResponse("Group already exists", 400);
      }

      // Create a placeholder customer with this group
      const placeholderCustomer = await prisma.customer.create({
        data: {
          name: `[Nhóm] ${groupName.trim()}`,
          phone: placeholderPhone,
          status: "INACTIVE", // Mark as inactive so it doesn't show in normal lists
        },
      });

      await prisma.customerProfile.create({
        data: {
          customerId: placeholderCustomer.id,
          name: `[Nhóm] ${groupName.trim()}`,
          phone: placeholderPhone,
          preferences: {
            customerGroup: groupName.trim(),
            isGroupPlaceholder: true, // Flag to identify placeholder
          },
        },
      });

      return successResponse(
        { name: groupName.trim(), customerCount: 0 },
        `Group "${groupName.trim()}" created successfully`
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
          { name: groupName.trim(), customerCount: 0 },
          `Group "${groupName.trim()}" created successfully (mock - database not available)`
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error creating group:", error);
    return errorResponse(error.message || "Failed to create group", 500);
  }
}

