// ============================================
// KPI Engine - Commission & Bonus Calculations
// ============================================

import { prisma } from "@/lib/prisma";
import {
  CommissionConfig,
  KPITargets,
  PenaltyConfig,
} from "../types";
import { startOfMonth, endOfMonth, format, differenceInMinutes, isAfter } from "date-fns";

/**
 * Calculate service commission for an invoice
 */
export async function calculateServiceCommission(
  invoiceId: string,
  staffId: string
): Promise<number> {
  // Get staff salary profile
  const profile = await prisma.staffSalaryProfile.findFirst({
    where: { staffId },
  });

  if (!profile) {
    return 0;
  }

  const config = profile.commissionConfig as CommissionConfig;
  const serviceConfig = config.serviceCommission;

  // Get invoice with items
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: {
        where: {
          serviceId: { not: null },
        },
        include: {
          service: true,
        },
      },
    },
  });

  if (!invoice) {
    return 0;
  }

  let totalCommission = 0;

  for (const item of invoice.invoiceItems) {
    const lineTotal = Number(item.lineTotal);

    if (serviceConfig.type === "PERCENTAGE") {
      const commission = (lineTotal * serviceConfig.value) / 100;
      totalCommission += commission;
    } else if (serviceConfig.type === "FIXED") {
      totalCommission += serviceConfig.value * item.quantity;
    }

    // Check for tier-based commission
    if (serviceConfig.tiers && serviceConfig.tiers.length > 0) {
      const invoiceTotal = Number(invoice.total);
      // Find matching tier
      for (const tier of serviceConfig.tiers.sort(
        (a, b) => b.minRevenue - a.minRevenue
      )) {
        if (invoiceTotal >= tier.minRevenue) {
          const tierCommission = (lineTotal * tier.commission) / 100;
          totalCommission = Math.max(totalCommission, tierCommission);
          break;
        }
      }
    }
  }

  return totalCommission;
}

/**
 * Calculate retail/product commission for an invoice
 */
export async function calculateRetailCommission(
  invoiceId: string,
  staffId: string
): Promise<number> {
  // Get staff salary profile
  const profile = await prisma.staffSalaryProfile.findFirst({
    where: { staffId },
  });

  if (!profile) {
    return 0;
  }

  const config = profile.commissionConfig as CommissionConfig;
  const productConfig = config.productCommission;

  // Get invoice with product items
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: {
        where: {
          productId: { not: null },
        },
        include: {
          product: true,
        },
      },
    },
  });

  if (!invoice) {
    return 0;
  }

  let totalCommission = 0;

  for (const item of invoice.invoiceItems) {
    const lineTotal = Number(item.lineTotal);

    if (productConfig.type === "PERCENTAGE") {
      const commission = (lineTotal * productConfig.value) / 100;
      totalCommission += commission;
    } else if (productConfig.type === "FIXED") {
      totalCommission += productConfig.value * item.quantity;
    }
  }

  return totalCommission;
}

/**
 * Calculate KPI bonus for a staff member in a month
 */
export async function calculateKPIBonus(
  staffId: string,
  month: string // YYYY-MM
): Promise<number> {
  // Get staff salary profile
  const profile = await prisma.staffSalaryProfile.findFirst({
    where: { staffId },
  });

  if (!profile) {
    return 0;
  }

  const config = profile.commissionConfig as CommissionConfig;
  const kpiConfig = config.kpiBonus;

  if (!kpiConfig.enabled || !kpiConfig.targets || kpiConfig.targets.length === 0) {
    return 0;
  }

  // Get KPI summary for the month
  const kpiSummary = await prisma.kPISummary.findFirst({
    where: {
      staffId,
      month,
    },
  });

  if (!kpiSummary) {
    return 0;
  }

  let totalBonus = 0;

  for (const target of kpiConfig.targets) {
    let actualValue = 0;

    switch (target.metric) {
      case "REVENUE":
        actualValue = Number(kpiSummary.revenue);
        break;
      case "SERVICE_COUNT":
        actualValue = kpiSummary.serviceCount;
        break;
      case "PRODUCT_SALES":
        actualValue = Number(kpiSummary.productSales);
        break;
    }

    if (actualValue >= target.target) {
      totalBonus += target.bonus;
    }
  }

  return totalBonus;
}

/**
 * Calculate attendance penalty for a date range
 */
export async function calculateAttendancePenalty(
  staffId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Get staff salary profile
  const profile = await prisma.staffSalaryProfile.findFirst({
    where: { staffId },
  });

  if (!profile) {
    return 0;
  }

  const penaltyConfig = profile.penalties as PenaltyConfig;

  // Get daily records for the period
  const records = await prisma.staffDailyRecord.findMany({
    where: {
      staffId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  let totalPenalty = 0;

  for (const record of records) {
    // Late penalty
    if (record.status === "LATE" && penaltyConfig.latePenalty.enabled) {
      totalPenalty += penaltyConfig.latePenalty.amount;
    }

    // Absent penalty
    if (record.status === "ABSENT" && penaltyConfig.absentPenalty.enabled) {
      totalPenalty += penaltyConfig.absentPenalty.amount;
    }
  }

  return totalPenalty;
}

/**
 * Calculate overtime pay for a date range
 */
export async function calculateOvertime(
  staffId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Get staff salary profile
  const profile = await prisma.staffSalaryProfile.findFirst({
    where: { staffId },
  });

  if (!profile) {
    return 0;
  }

  const baseSalary = profile.baseSalary;
  const hourlyRate = baseSalary / (22 * 8); // Assuming 22 working days, 8 hours per day
  const overtimeRate = hourlyRate * 1.5; // 1.5x for overtime

  // Get daily records with check-in/out times
  const records = await prisma.staffDailyRecord.findMany({
    where: {
      staffId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      checkIn: { not: null },
      checkOut: { not: null },
    },
  });

  let totalOvertime = 0;
  const standardHoursPerDay = 8;

  for (const record of records) {
    if (record.checkIn && record.checkOut) {
      const minutesWorked = differenceInMinutes(record.checkOut, record.checkIn);
      const hoursWorked = minutesWorked / 60;

      if (hoursWorked > standardHoursPerDay) {
        const overtimeHours = hoursWorked - standardHoursPerDay;
        totalOvertime += overtimeHours * overtimeRate;
      }
    }
  }

  return totalOvertime;
}

/**
 * Update KPI summary for a staff member
 */
export async function updateKPISummary(
  staffId: string,
  month: string // YYYY-MM
): Promise<void> {
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = startOfMonth(new Date(year, monthNum - 1));
  const endDate = endOfMonth(new Date(year, monthNum - 1));

  // Calculate revenue from invoices (using commission records to find staff invoices)
  const commissionInvoices = await prisma.commissionRecord.findMany({
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

  const invoiceIds = commissionInvoices
    .map((c) => c.invoiceId)
    .filter((id): id is string => !!id);

  const revenueResult = await prisma.invoice.aggregate({
    where: {
      id: { in: invoiceIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      total: true,
    },
  });

  const revenue = Number(revenueResult._sum.total || 0);

  // Count services from commission records
  const serviceCount = await prisma.commissionRecord.count({
    where: {
      staffId,
      type: "SERVICE",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate product sales from commission records
  const productSalesResult = await prisma.commissionRecord.aggregate({
    where: {
      staffId,
      type: "RETAIL",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const productSales = Number(productSalesResult._sum.amount || 0);

  // Count attendance
  const attendanceRecords = await prisma.staffDailyRecord.findMany({
    where: {
      staffId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const attendanceDays = attendanceRecords.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE"
  ).length;
  const totalDays = attendanceRecords.length;

  // Calculate score (0-100)
  const profile = await prisma.staffSalaryProfile.findUnique({
    where: { staffId },
  });

  let score = 0;
  if (profile) {
    const targets = profile.kpiTargets as KPITargets;
    const revenueScore = targets.monthlyRevenue > 0
      ? Math.min(100, (revenue / targets.monthlyRevenue) * 100)
      : 0;
    const serviceScore = targets.monthlyServiceCount > 0
      ? Math.min(100, (serviceCount / targets.monthlyServiceCount) * 100)
      : 0;
    const attendanceScore = targets.attendanceRate > 0
      ? Math.min(100, (attendanceDays / totalDays) * 100)
      : 0;

    score = (revenueScore * 0.5 + serviceScore * 0.3 + attendanceScore * 0.2);
  }

  // Upsert KPI summary
  const existing = await prisma.kPISummary.findFirst({
    where: {
      staffId,
      month,
    },
  });

  if (existing) {
    await prisma.kPISummary.update({
      where: { id: existing.id },
      data: {
        revenue,
        serviceCount,
        productSales,
        score,
      },
    });
  } else {
    await prisma.kPISummary.create({
      data: {
        staffId,
        month,
        revenue,
        serviceCount,
        productSales,
        score,
      },
    });
  }
}

