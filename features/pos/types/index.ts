// ============================================
// POS Types
// ============================================

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  CARD = "CARD",
  OTHER = "OTHER",
}

export interface Invoice {
  id: string;
  bookingId: string | null;
  customerId: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  updatedAt: string;
  invoiceItems?: InvoiceItem[];
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  booking?: {
    id: string;
    bookingDate: string;
    bookingTime: string;
  };
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceId: string | null;
  productId: string | null;
  staffId: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    name: string;
  };
  product?: {
    id: string;
    name: string;
  };
  staff?: {
    id: string;
    employeeId: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CheckoutRequest {
  bookingId: string;
  items: CheckoutItem[];
  discountAmount?: number;
  paymentMethod: PaymentMethod;
  markAsPaid: boolean;
}

export interface CheckoutItem {
  serviceId?: string;
  productId?: string;
  staffId?: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutResponse {
  invoice: Invoice;
  invoiceItems: InvoiceItem[];
}

