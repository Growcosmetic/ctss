// ============================================
// Salary Engine - Monthly Salary Computation
// ============================================

import { prisma } from "@/lib/prisma";
import {
  SalaryBreakdown,
  SalaryPayout,
} from "../types";
import {
  calculateServiceCommission,
  calculateRetailCommission,
  calculateKPIBonus,
  calculateAttendancePenalty,
  calculateOvertime,
  updateKPISummary,
} from "./kpiEngine";
import { startOfMonth, endOfMonth, format } from "date-fns";

/**
 * Compute monthly salary for a staff member
 */
export async function computeMonthlySalary(
  staffId: string,
  month: string // YYYY-MM
): Promise<{
  breakdown: SalaryBreakdown;
  total: number;
}> {
  // Update KPI summary first
  await updateKPISummary(staffId, month);

  // Get staff salary profile
  const profile = await prisma.staffSalaryProfile.findFirst({
    where: { staffId },
  });

  if (!profile) {
    throw new Error("Staff salary profile not found");
  }

  const baseSalary = profile.baseSalary;

  // Get date range for the month
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = startOfMonth(new Date(year, monthNum - 1));
  const endDate = endOfMonth(new Date(year, monthNum - 1));

  // Get all invoices with commissions for this staff in the month
  const commissionRecords = await prisma.commissionRecord.findMany({
    where: {
      staffId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      invoiceId: true,
    },
    distinct: ["invoiceId"],
  });

  const invoiceIds = commissionRecords
    .map((c) => c.invoiceId)
    .filter((id): id is string => !!id);

  const invoices = await prisma.invoice.findMany({
    where: {
      id: { in: invoiceIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate service commissions
  let totalServiceCommission = 0;
  for (const invoice of invoices) {
    const commission = await calculateServiceCommission(invoice.id, staffId);
    totalServiceCommission += commission;
  }

  // Calculate product commissions
  let totalProductCommission = 0;
  for (const invoice of invoices) {
    const commission = await calculateRetailCommission(invoice.id, staffId);
    totalProductCommission += commission;
  }

  // Calculate KPI bonus
  const kpiBonus = await calculateKPIBonus(staffId, month);

  // Calculate overtime
  const overtime = await calculateOvertime(staffId, startDate, endDate);

  // Calculate penalties
  const penalties = await calculateAttendancePenalty(staffId, startDate, endDate);

  // Tips (would need to be manually entered or from another source)
  const tips = 0; // TODO: Implement tips tracking

  // Build breakdown
  const breakdown: SalaryBreakdown = {
    baseSalary,
    commissions: {
      service: totalServiceCommission,
      product: totalProductCommission,
      total: totalServiceCommission + totalProductCommission,
    },
    bonuses: {
      kpi: kpiBonus,
      overtime,
      tips,
      total: kpiBonus + overtime + tips,
    },
    deductions: {
      late: penalties, // Simplified - would break down by type
      absent: 0,
      uniform: 0,
      behavior: 0,
      total: penalties,
    },
    summary: {
      gross: baseSalary + totalServiceCommission + totalProductCommission + kpiBonus + overtime + tips,
      deductions: penalties,
      net: baseSalary + totalServiceCommission + totalProductCommission + kpiBonus + overtime + tips - penalties,
    },
  };

  return {
    breakdown,
    total: breakdown.summary.net,
  };
}

/**
 * Generate salary for all staff in a branch
 */
export async function generateSalaryForAllStaff(
  branchId: string,
  month: string // YYYY-MM
): Promise<SalaryPayout[]> {
  // Get all users in the branch with salary profiles
  const users = await prisma.user.findMany({
    where: {
      branchId,
      role: {
        in: ["STYLIST", "ASSISTANT", "RECEPTIONIST"],
      },
    },
    include: {
      staff: {
        include: {
          salaryProfile: true,
        },
      },
    },
  });

  const payouts: SalaryPayout[] = [];

  for (const user of users) {
    if (!user.staff || !user.staff.salaryProfile) {
      continue; // Skip users without staff or salary profile
    }

    try {
      const { breakdown, total } = await computeMonthlySalary(
        user.staff.id,
        month
      );

      // Create or update salary payout
      const existing = await prisma.salaryPayout.findFirst({
        where: {
          staffId: user.id,
          month,
        },
      });

      const payout = existing
        ? await prisma.salaryPayout.update({
            where: { id: existing.id },
            data: {
              totalSalary: total,
              breakdown: breakdown as any,
              branchId: branchId,
            },
            include: {
              staff: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          })
        : await prisma.salaryPayout.create({
            data: {
              staffId: user.staff.id,
              branchId: branchId,
              month,
              totalSalary: total,
              breakdown: breakdown as any,
              baseSalary: breakdown.baseSalary,
              serviceCommission: breakdown.commissions.service,
              productCommission: breakdown.commissions.product,
              kpiBonus: breakdown.bonuses.kpi,
              overtime: breakdown.bonuses.overtime,
              tips: breakdown.bonuses.tips,
              penalties: breakdown.deductions.total,
            },
            include: {
              staff: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          });

      payouts.push({
        id: payout.id,
        staffId: payout.staffId,
        branchId: payout.branchId,
        month: payout.month,
        totalSalary: payout.totalSalary,
        breakdown: payout.breakdown as SalaryBreakdown,
        status: payout.status as "DRAFT" | "APPROVED" | "PAID",
        generatedAt: payout.generatedAt,
        paidAt: payout.paidAt,
        staff: payout.staff?.user
          ? {
              id: payout.staff.user.id,
              name: `${payout.staff.user.firstName} ${payout.staff.user.lastName}`,
              phone: payout.staff.user.phone || "",
            }
          : undefined,
      });
    } catch (error) {
      console.error(
        `Error generating salary for staff ${user.id}:`,
        error
      );
      // Continue with other staff
    }
  }

  return payouts;
}

/**
 * Record commission when invoice is paid
 */
export async function recordCommission(
  invoiceId: string,
  staffId: string
): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
    },
  });

  if (!invoice) {
    return;
  }

  // Calculate and record service commissions
  const serviceCommission = await calculateServiceCommission(invoiceId, staffId);
  if (serviceCommission > 0) {
    // Find first service item for reference
    const serviceItem = invoice.items.find((item) => item.serviceId);
    await prisma.commissionRecord.create({
      data: {
        staffId,
        invoiceId,
        serviceId: serviceItem?.serviceId || null,
        type: "SERVICE",
        amount: serviceCommission,
      },
    });
  }

  // Calculate and record product commissions
  const productCommission = await calculateRetailCommission(invoiceId, staffId);
  if (productCommission > 0) {
    // Find first product item for reference
    const productItem = invoice.items.find((item) => item.productId);
    await prisma.commissionRecord.create({
      data: {
        staffId,
        invoiceId,
        productId: productItem?.productId || null,
        type: "RETAIL",
        amount: productCommission,
      },
    });
  }
}

