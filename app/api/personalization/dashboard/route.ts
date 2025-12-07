// ============================================
// PHASE 31F - Personalization Dashboard
// ============================================

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

// GET /api/personalization/dashboard
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

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return errorResponse("Access denied", 403);
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (customerId) {
      // Get customer-specific dashboard
      return await getCustomerDashboard(customerId);
    }

    // Get system-wide dashboard
    const totalCustomers = await prisma.customer.count();
    const profiledCustomers = await prisma.customerPersonalityProfile.count();
    const totalMemories = await prisma.minaMemory.count();
    const totalRecommendations = await prisma.personalizedRecommendation.count({
      where: { status: "ACTIVE" },
    });
    const acceptedRecommendations = await prisma.personalizedRecommendation.count({
      where: { status: "ACCEPTED" },
    });

    const acceptanceRate =
      totalRecommendations > 0
        ? (acceptedRecommendations / totalRecommendations) * 100
        : 0;

    const totalStylists = await prisma.user.count({
      where: { role: "STYLIST" },
    });
    const stylistsWithSignature = await prisma.stylistSignatureStyle.count();

    // Top customers by personalization
    const topPersonalizedCustomers = await prisma.customerPersonalityProfile.findMany({
      orderBy: { interactionsCount: "desc" },
      take: 10,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return successResponse({
      overview: {
        totalCustomers,
        profiledCustomers,
        profilingRate: totalCustomers > 0 ? (profiledCustomers / totalCustomers) * 100 : 0,
        totalMemories,
        totalRecommendations,
        acceptedRecommendations,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        totalStylists,
        stylistsWithSignature,
        stylistSignatureRate:
          totalStylists > 0 ? (stylistsWithSignature / totalStylists) * 100 : 0,
      },
      topPersonalizedCustomers: topPersonalizedCustomers.map((p) => ({
        customerId: p.customer.id,
        customerName: p.customer.name,
        interactionsCount: p.interactionsCount,
        styleVibe: p.styleVibe,
        personality: p.personality,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching dashboard:", error);
    return errorResponse(error.message || "Failed to fetch dashboard", 500);
  }
}

async function getCustomerDashboard(customerId: string) {
  const profile = await prisma.customerPersonalityProfile.findUnique({
    where: { customerId },
  });

  if (!profile) {
    return errorResponse("Customer profile not found", 404);
  }

  const memories = await prisma.minaMemory.findMany({
    where: { customerId },
    orderBy: { lastUsed: "desc" },
    take: 10,
  });

  const recommendations = await prisma.personalizedRecommendation.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const styleHistory = await prisma.customerStyleHistory.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const followUps = await prisma.personalizedFollowUp.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const metrics = await prisma.personalizationMetric.findFirst({
    where: {
      customerId,
      periodType: "MONTHLY",
    },
    orderBy: { periodStart: "desc" },
  });

  return successResponse({
    profile,
    memories,
    recommendations,
    styleHistory,
    followUps,
    metrics,
  });
}

