import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

function validateToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

// GET /api/partner/list
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
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // HQ sees all partners
    if (user.role === "ADMIN") {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const plan = searchParams.get("plan");

      const where: any = {};
      if (status) {
        where.licenseStatus = status;
      }
      if (plan) {
        where.plan = plan;
      }

      const partners = await prisma.partner.findMany({
        where,
        include: {
          _count: {
            select: {
              branches: true,
              users: true,
            },
          },
          licenses: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return successResponse(partners);
    }

    // Partner users see only their partner
    if (user.partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { id: user.partnerId },
        include: {
          _count: {
            select: {
              branches: true,
              users: true,
            },
          },
          licenses: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      return successResponse(partner ? [partner] : []);
    }

    return errorResponse("Access denied", 403);
  } catch (error: any) {
    console.error("Error listing partners:", error);
    return errorResponse(error.message || "Failed to list partners", 500);
  }
}

