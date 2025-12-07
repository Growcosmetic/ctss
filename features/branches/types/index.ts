// ============================================
// Branch Types
// ============================================

export interface Branch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  managerId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface BranchStaff {
  id: string;
  branchId: string;
  staffId: string;
  role: "STYLIST" | "ASSISTANT" | "MANAGER";
  isActive: boolean;
  branch?: Branch;
  staff?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface BranchKPIs {
  branchId: string;
  branchName: string;
  todayRevenue: number;
  todayBookings: number;
  todayStaffWorking: number;
  weekRevenue: number;
  weekBookings: number;
  monthRevenue: number;
  monthBookings: number;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
}

export interface BranchComparison {
  branchId: string;
  branchName: string;
  revenue: number;
  bookings: number;
  averageTicket: number;
  growth: number; // percentage
}

