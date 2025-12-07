import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

// GET /api/partner/license/check-expiry
// This should be called by a cron job daily
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Find licenses expiring soon
    const expiringLicenses = await prisma.license.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lte: threeDaysFromNow,
          gte: now,
        },
        reminderSent: false,
      },
      include: {
        partner: true,
      },
    });

    // Find expired licenses
    const expiredLicenses = await prisma.license.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: now,
        },
      },
      include: {
        partner: true,
      },
    });

    // Update expired licenses
    for (const license of expiredLicenses) {
      await prisma.license.update({
        where: { id: license.id },
        data: {
          status: "EXPIRED",
        },
      });

      await prisma.partner.update({
        where: { id: license.partnerId },
        data: {
          licenseStatus: "EXPIRED",
        },
      });
    }

    // Mark reminders as sent
    for (const license of expiringLicenses) {
      await prisma.license.update({
        where: { id: license.id },
        data: {
          reminderSent: true,
          reminderSentAt: new Date(),
        },
      });
    }

    return successResponse({
      expiring: expiringLicenses.length,
      expired: expiredLicenses.length,
      expiringLicenses: expiringLicenses.map(l => ({
        id: l.id,
        partnerId: l.partnerId,
        salonName: l.partner.salonName,
        endDate: l.endDate,
      })),
      expiredLicenses: expiredLicenses.map(l => ({
        id: l.id,
        partnerId: l.partnerId,
        salonName: l.partner.salonName,
        endDate: l.endDate,
      })),
    });
  } catch (error: any) {
    console.error("Error checking license expiry:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to check expiry" },
      { status: 500 }
    );
  }
}

