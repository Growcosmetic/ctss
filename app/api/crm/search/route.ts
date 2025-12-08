import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/crm/search?q=...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return successResponse([], "No search query provided");
    }

    const query = q.trim();

    // Search by phone or name
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { phone: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(customers);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to search customers", 500);
  }
}

