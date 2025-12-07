// ============================================
// AI Manager Types
// ============================================

export interface BranchKPIs {
  branchId: string;
  branchName: string;
  timeRange: "today" | "week" | "month" | "year";
  revenue: {
    total: number;
    trend: number; // percentage change
    byDay?: Array<{ date: string; revenue: number }>;
  };
  bookings: {
    total: number;
    trend: number;
    byDay?: Array<{ date: string; count: number }>;
  };
  averageTicket: number;
  customerCount: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface StaffKPIs {
  staffId: string;
  staffName: string;
  branchId: string;
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  revenue: {
    total: number;
    averageTicket: number;
  };
  rating?: number;
  workload: number; // percentage
}

export interface ServiceKPIs {
  serviceId: string;
  serviceName: string;
  branchId: string;
  bookings: {
    total: number;
    trend: number;
  };
  revenue: {
    total: number;
    averagePrice: number;
    trend: number;
  };
  popularity: "HOT" | "NORMAL" | "COLD";
}

export interface CustomerTrends {
  branchId: string;
  newCustomers: number;
  returningCustomers: number;
  churnRate: number;
  averageReturnDays: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    visits: number;
    revenue: number;
  }>;
}

export interface ChurnAnalysis {
  branchId: string;
  highRiskCustomers: Array<{
    customerId: string;
    customerName: string;
    lastVisit: Date;
    predictedReturnDate: Date;
    daysOverdue: number;
    riskLevel: "HIGH" | "MEDIUM" | "LOW";
  }>;
  churnRate: number;
  trend: number;
}

export interface MarketingKPIs {
  branchId: string;
  campaigns: Array<{
    campaignId: string;
    name: string;
    conversionRate: number;
    revenue: number;
  }>;
  loyaltyImpact: {
    tierUpgrades: number;
    pointsRedeemed: number;
    revenueFromLoyalty: number;
  };
}

export interface Forecast {
  type: "REVENUE" | "BOOKINGS" | "STYLIST_LOAD" | "LOW_DAYS" | "CHURN";
  branchId: string;
  predictions: Array<{
    date: string;
    value: number;
    confidence: number; // 0-1
  }>;
  summary: string;
}

export interface Alert {
  id: string;
  type: "REVENUE_DROP" | "OVERBOOK" | "SERVICE_DECLINE" | "VIP_OVERDUE" | "CHURN_RISK";
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  branchId?: string;
  staffId?: string;
  serviceId?: string;
  customerId?: string;
  createdAt: Date;
  data?: any;
}

export interface Recommendation {
  id: string;
  type: "MARKETING" | "TRAINING" | "SERVICE" | "SCHEDULING" | "PRICING";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
  branchId?: string;
  createdAt: Date;
}

