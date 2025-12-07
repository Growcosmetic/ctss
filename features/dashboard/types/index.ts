// ============================================
// Dashboard Types
// ============================================

export interface TodayStats {
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  noShowCount: number;
  newCustomers: number;
  revenueChange?: number; // % change from yesterday
}

export interface StaffPerformance {
  staffId: string;
  name: string;
  avatar?: string | null;
  bookingsToday: number;
  revenueToday: number;
  workloadPercentage: number; // booking hours / working hours
  completedBookings: number;
}

export interface TimelineSlot {
  time: string; // "08:00", "08:30", etc.
  bookings: TimelineBooking[];
  isCurrentTime: boolean;
}

export interface TimelineBooking {
  id: string;
  customerName: string;
  serviceName: string;
  stylistName: string;
  startTime: string;
  endTime: string;
  status: "upcoming" | "in-service" | "completed" | "no-show";
  duration: number; // minutes
}

export interface DashboardAlert {
  id: string;
  type: "churn-risk" | "customer-note" | "system" | "revenue" | "overdue";
  priority: "high" | "medium" | "low";
  title: string;
  message: string;
  icon: string;
  actionUrl?: string;
  data?: {
    customerId?: string;
    bookingId?: string;
    invoiceId?: string;
  };
}

export interface DashboardData {
  stats: TodayStats;
  staffPerformance: StaffPerformance[];
  timeline: TimelineSlot[];
  alerts: DashboardAlert[];
}
