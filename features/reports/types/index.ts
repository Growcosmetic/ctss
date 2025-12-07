// ============================================
// Reports Types
// ============================================

export interface RevenueSummary {
  totalRevenue: number;
  totalDiscount: number;
  totalInvoices: number;
  revenueByPaymentMethod: {
    CASH: number;
    TRANSFER: number;
    CARD: number;
    OTHER: number;
  };
  revenueByDay: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
}

export interface ServiceReport {
  serviceId: string;
  serviceName: string;
  count: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface StaffReport {
  staffId: string;
  staffName: string;
  totalRevenue: number;
  customersServed: number;
  avgTicket: number;
}

export interface BookingBehavior {
  newCustomers: number;
  returningCustomers: number;
  noShowCount: number;
  bookingByDay: Array<{
    date: string;
    count: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }>;
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

