// ============================================
// Staff View Types
// ============================================

export interface StaffBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  serviceName: string;
  serviceId: string;
  bookingTime: string;
  duration: number;
  status: "UPCOMING" | "IN_SERVICE" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  totalAmount?: number;
}

export interface ServiceChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  order: number;
}

export interface ServiceChecklist {
  bookingId: string;
  serviceId: string;
  items: ServiceChecklistItem[];
  completedAt?: string;
}

export interface CustomerQuickInfo {
  customerId: string;
  name: string;
  phone: string;
  lastServices: Array<{
    date: string;
    serviceName: string;
  }>;
  minaSummary?: any; // From Mina generateCustomerSummary
  churnRisk?: any; // From Mina detectChurnRisk
  notes?: string;
  preferences?: any;
}

export interface StaffNotification {
  id: string;
  type: "NEW_BOOKING" | "BOOKING_UPDATED" | "CUSTOMER_CHECKIN" | "PRE_VISIT" | "HIGH_RISK";
  title: string;
  message: string;
  bookingId?: string;
  customerId?: string;
  createdAt: Date;
}

