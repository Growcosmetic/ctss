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

// GET /api/partner/hq/dashboard
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

    if (!user || user.role !== "ADMIN") {
      return errorResponse("Only HQ can access dashboard", 403);
    }

    // Get system overview
    const totalPartners = await prisma.partner.count({
      where: { isActive: true },
    });

    const activePartners = await prisma.partner.count({
      where: {
        isActive: true,
        licenseStatus: "ACTIVE",
      },
    });

    const expiredPartners = await prisma.partner.count({
      where: {
        licenseStatus: "EXPIRED",
      },
    });

    const totalBranches = await prisma.branch.count({
      where: { isActive: true },
    });

    // Get total revenue from all partners
    const { searchParams } = new URL(request.url);
    const periodStart = searchParams.get("periodStart") 
      ? new Date(searchParams.get("periodStart")!) 
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodEnd = searchParams.get("periodEnd")
      ? new Date(searchParams.get("periodEnd")!)
      : new Date();

    // Get all branches with active partners first
    const activeBranches = await prisma.branch.findMany({
      where: {
        isActive: true,
        partner: {
          isActive: true,
        },
      },
      select: { id: true },
    });

    const branchIds = activeBranches.map(b => b.id);

    const allInvoices = await prisma.invoice.findMany({
      where: {
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
        branchId: {
          in: branchIds,
        },
      },
    });

    const totalRevenue = allInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Get license revenue
    const activeLicenses = await prisma.license.findMany({
      where: {
        status: "ACTIVE",
        partner: {
          isActive: true,
        },
      },
    });

    const monthlyLicenseRevenue = activeLicenses.reduce((sum, license) => sum + license.price, 0);

    // Get partner rankings
    const partnerPerformances = await prisma.partnerPerformance.findMany({
      where: {
        periodStart: {
          gte: periodStart,
        },
        periodEnd: {
          lte: periodEnd,
        },
        periodType: "MONTHLY",
      },
      include: {
        partner: true,
      },
      orderBy: {
        revenue: "desc",
      },
      take: 10,
    });

    // Get quality rankings
    const qualityScores = await prisma.partnerQualityScore.findMany({
      where: {
        periodStart: {
          gte: periodStart,
        },
        periodEnd: {
          lte: periodEnd,
        },
      },
      include: {
        partner: true,
      },
      orderBy: {
        overallScore: "desc",
      },
      take: 10,
    });

    // Get expiring licenses
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringLicenses = await prisma.license.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lte: threeDaysFromNow,
          gte: new Date(),
        },
        reminderSent: false,
      },
      include: {
        partner: true,
      },
    });

    // Get alerts
    const recentErrors = await prisma.errorDetection.findMany({
      where: {
        severity: "CRITICAL",
        detectedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      take: 10,
    });

    // Get branch and partner info for errors
    const errorDetails = await Promise.all(
      recentErrors.map(async (error) => {
        if (!error.bookingId) return null;
        const booking = await prisma.booking.findUnique({
          where: { id: error.bookingId },
          include: {
            branch: {
              include: {
                partner: true,
              },
            },
          },
        });
        return {
          ...error,
          booking,
        };
      })
    );

    return successResponse({
      overview: {
        totalPartners,
        activePartners,
        expiredPartners,
        totalBranches,
        totalRevenue,
        monthlyLicenseRevenue,
      },
      topPerformers: partnerPerformances.map(p => ({
        partnerId: p.partner.id,
        salonName: p.partner.salonName,
        revenue: p.revenue,
        profit: p.profit,
      })),
      topQuality: qualityScores.map(q => ({
        partnerId: q.partner.id,
        salonName: q.partner.salonName,
        overallScore: q.overallScore,
        sopCompliance: q.sopCompliance,
      })),
      alerts: {
        expiringLicenses: expiringLicenses.map(l => ({
          id: l.id,
          partnerId: l.partnerId,
          salonName: l.partner.salonName,
          endDate: l.endDate,
        })),
        criticalErrors: errorDetails
          .filter(e => e?.booking)
          .map(e => ({
            id: e!.id,
            partnerId: e!.booking!.branch?.partner?.id,
            salonName: e!.booking!.branch?.partner?.salonName,
            errorType: e!.errorType,
            severity: e!.severity,
          })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching HQ dashboard:", error);
    return errorResponse(error.message || "Failed to fetch dashboard", 500);
  }
}

