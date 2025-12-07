// ============================================
// Salary Types
// ============================================

export interface StaffSalaryProfile {
  id: string;
  staffId: string;
  baseSalary: number;
  commissionConfig: CommissionConfig;
  kpiTargets: KPITargets;
  penalties: PenaltyConfig;
  updatedAt: Date;
  staff?: {
    id: string;
    employeeId: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CommissionConfig {
  serviceCommission: {
    type: "PERCENTAGE" | "FIXED";
    value: number; // percentage or fixed amount
    tiers?: Array<{
      minRevenue: number;
      commission: number;
    }>;
  };
  productCommission: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
  };
  kpiBonus: {
    enabled: boolean;
    targets: Array<{
      metric: "REVENUE" | "SERVICE_COUNT" | "PRODUCT_SALES";
      target: number;
      bonus: number;
    }>;
  };
}

export interface KPITargets {
  monthlyRevenue: number;
  monthlyServiceCount: number;
  monthlyProductSales: number;
  attendanceRate: number; // percentage
}

export interface PenaltyConfig {
  latePenalty: {
    enabled: boolean;
    amount: number; // per occurrence
    graceMinutes: number;
  };
  absentPenalty: {
    enabled: boolean;
    amount: number; // per day
  };
  uniformPenalty: {
    enabled: boolean;
    amount: number;
  };
  behaviorPenalty: {
    enabled: boolean;
    amount: number;
  };
}

export interface StaffDailyRecord {
  id: string;
  staffId: string;
  date: Date;
  checkIn?: Date | null;
  checkOut?: Date | null;
  status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE";
  notes?: string | null;
  location?: {
    lat: number;
    lng: number;
  } | null;
  staff?: {
    id: string;
    employeeId: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CommissionRecord {
  id: string;
  staffId: string;
  invoiceId: string;
  serviceId?: string | null;
  productId?: string | null;
  amount: number;
  type: "SERVICE" | "PRODUCT";
  createdAt: Date;
  staff?: {
    id: string;
    employeeId: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  invoice?: {
    id: string;
    total: number;
    createdAt: Date;
  };
}

export interface KPISummary {
  id: string;
  staffId: string;
  month: string; // YYYY-MM
  revenue: number;
  serviceCount: number;
  productSales: number;
  score: number; // 0-100
  staff?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface SalaryPayout {
  id: string;
  staffId: string;
  branchId: string;
  month: string; // YYYY-MM
  totalSalary: number;
  breakdown: SalaryBreakdown;
  status: "DRAFT" | "APPROVED" | "PAID";
  generatedAt: Date;
  paidAt?: Date | null;
  staff?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface SalaryBreakdown {
  baseSalary: number;
  commissions: {
    service: number;
    product: number;
    total: number;
  };
  bonuses: {
    kpi: number;
    overtime: number;
    tips: number;
    total: number;
  };
  deductions: {
    late: number;
    absent: number;
    uniform: number;
    behavior: number;
    total: number;
  };
  summary: {
    gross: number;
    deductions: number;
    net: number;
  };
}

export interface AttendanceSummary {
  staffId: string;
  staffName: string;
  month: string;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  leaveDays: number;
  attendanceRate: number;
}

