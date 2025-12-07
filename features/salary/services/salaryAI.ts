// ============================================
// AI Salary Assistant
// ============================================

import { prisma } from "@/lib/prisma";
import { SalaryPayout, KPISummary } from "../types";
import { format } from "date-fns";

/**
 * Generate salary summary with AI insights
 */
export async function generateSalarySummary(
  staffId: string,
  month: string
): Promise<{
  summary: string;
  anomalies: string[];
  suggestions: string[];
}> {
  // Get salary payout
  const payout = await prisma.salaryPayout.findFirst({
    where: {
      staffId,
      month,
    },
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  if (!payout) {
    return {
      summary: "Chưa có dữ liệu lương cho tháng này",
      anomalies: [],
      suggestions: [],
    };
  }

  // Get KPI summary
  const kpiSummary = await prisma.kPISummary.findFirst({
    where: {
      staffId,
      month,
    },
  });

  const staffName = payout.staff ? payout.staff.name : "Nhân viên";

  // Generate summary
  const breakdown = payout.breakdown as any;
  const summary = `
**Tóm tắt lương tháng ${month} - ${staffName}**

💰 **Tổng lương:** ${payout.totalSalary.toLocaleString("vi-VN")} VND

📊 **Chi tiết:**
- Lương cơ bản: ${breakdown.baseSalary.toLocaleString("vi-VN")} VND
- Hoa hồng dịch vụ: ${breakdown.commissions.service.toLocaleString("vi-VN")} VND
- Hoa hồng sản phẩm: ${breakdown.commissions.product.toLocaleString("vi-VN")} VND
- Bonus KPI: ${breakdown.bonuses.kpi.toLocaleString("vi-VN")} VND
- Tăng ca: ${breakdown.bonuses.overtime.toLocaleString("vi-VN")} VND
- Tips: ${breakdown.bonuses.tips.toLocaleString("vi-VN")} VND
- Phạt: ${breakdown.deductions.total.toLocaleString("vi-VN")} VND

${kpiSummary ? `📈 **KPI:** ${kpiSummary.score}/100 điểm` : ""}
  `.trim();

  // Detect anomalies
  const anomalies: string[] = [];
  const suggestions: string[] = [];

  // Check if salary is unusually high or low
  const avgSalary = breakdown.baseSalary;
  const totalSalary = payout.totalSalary;
  const commissionRatio = (breakdown.commissions.total) / totalSalary;

  if (commissionRatio > 0.5) {
    anomalies.push("Tỷ lệ hoa hồng chiếm hơn 50% tổng lương - cần kiểm tra");
  }

  if (breakdown.deductions.total > avgSalary * 0.1) {
    anomalies.push("Phạt quá nhiều (>10% lương cơ bản) - cần xem xét");
  }

  // KPI-based suggestions
  if (kpiSummary) {
    const kpiScore = kpiSummary.score;
    const revenue = kpiSummary.revenue;
    const serviceCount = kpiSummary.serviceCount;

    if (kpiScore >= 145) {
      suggestions.push(
        `${staffName} đạt ${kpiScore.toFixed(1)}% KPI - đề xuất thưởng thêm 800,000 VND`
      );
    } else if (kpiScore >= 120) {
      suggestions.push(
        `${staffName} đạt ${kpiScore.toFixed(1)}% KPI - đề xuất thưởng thêm 500,000 VND`
      );
    }

    // Product sales performance
    const productSales = kpiSummary.productSales;
    if (productSales > 5000000) {
      suggestions.push(
        `${staffName} bán retail tốt (${(productSales / 1000000).toFixed(1)}M VND) - đề xuất thưởng nóng`
      );
    }

    // Service count performance
    if (serviceCount > 50) {
      suggestions.push(
        `${staffName} hoàn thành ${serviceCount} dịch vụ - hiệu suất cao`
      );
    }
  }

  // Attendance-based suggestions
  const attendanceRate = kpiSummary
    ? (kpiSummary.attendanceDays / kpiSummary.totalDays) * 100
    : 0;

  if (attendanceRate < 80) {
    suggestions.push(
      `Tỷ lệ chấm công ${attendanceRate.toFixed(1)}% - cần cải thiện`
    );
  } else if (attendanceRate === 100) {
    suggestions.push(
      `Chấm công hoàn hảo 100% - đề xuất thưởng chuyên cần`
    );
  }

  return {
    summary,
    anomalies,
    suggestions,
  };
}

/**
 * Detect salary anomalies across all staff
 */
export async function detectSalaryAnomalies(
  branchId: string,
  month: string
): Promise<
  Array<{
    staffId: string;
    staffName: string;
    issue: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
  }>
> {
  // Get all users in branch
  const users = await prisma.user.findMany({
    where: { branchId },
    select: { id: true },
  });

  const userIds = users.map((u) => u.id);

  const payouts = await prisma.salaryPayout.findMany({
    where: {
      staffId: { in: userIds },
      month,
    },
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  const anomalies: Array<{
    staffId: string;
    staffName: string;
    issue: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
  }> = [];

  // Calculate average salary
  const avgSalary =
    payouts.reduce((sum, p) => sum + Number(p.totalSalary), 0) /
    payouts.length;

  for (const payout of payouts) {
    const staffName = payout.staff ? payout.staff.name : "Unknown";
    const totalSalary = payout.totalSalary;
    const breakdown = payout.breakdown as any;
    const baseSalary = breakdown.baseSalary;

    // Check for unusually high salary
    if (totalSalary > avgSalary * 2) {
      anomalies.push({
        staffId: payout.staffId,
        staffName,
        issue: `Lương quá cao (${totalSalary.toLocaleString("vi-VN")} VND) - gấp ${(totalSalary / avgSalary).toFixed(1)}x mức trung bình`,
        severity: "HIGH",
      });
    }

    // Check for unusually low salary
    if (totalSalary < baseSalary * 0.5) {
      anomalies.push({
        staffId: payout.staffId,
        staffName,
        issue: `Lương quá thấp (${totalSalary.toLocaleString("vi-VN")} VND) - chỉ bằng ${((totalSalary / baseSalary) * 100).toFixed(1)}% lương cơ bản`,
        severity: "HIGH",
      });
    }

    // Check for high penalties
    const penaltyRatio = breakdown.deductions.total / baseSalary;
    if (penaltyRatio > 0.2) {
      anomalies.push({
        staffId: payout.staffId,
        staffName,
        issue: `Phạt quá nhiều (${((penaltyRatio * 100).toFixed(1))}% lương cơ bản)`,
        severity: "MEDIUM",
      });
    }
  }

  return anomalies;
}

