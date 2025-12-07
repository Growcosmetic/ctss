// ============================================
// CRM Types
// ============================================

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum CustomerStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLACKLISTED = "BLACKLISTED",
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  notes?: string | null;
  preferences?: any;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate?: string | null;
  loyaltyPoints: number;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  tags?: CustomerTag[];
  bookings?: BookingSummary[];
  invoices?: InvoiceSummary[];
  recentServices?: ServiceSummary[];
}

export interface CustomerTag {
  id: string;
  customerId: string;
  label: string;
  color?: string;
  createdAt: string;
}

export interface BookingSummary {
  id: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  totalAmount: number;
  serviceName?: string;
}

export interface InvoiceSummary {
  id: string;
  total: number;
  status: string;
  paymentMethod?: string | null;
  createdAt: string;
}

export interface ServiceSummary {
  serviceId: string;
  serviceName: string;
  count: number;
  lastUsed: string;
}

export interface CustomerSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  notes?: string;
  preferences?: any;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  id: string;
}

export interface AddTagRequest {
  customerId: string;
  label: string;
  color?: string;
}

