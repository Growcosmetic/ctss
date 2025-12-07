// ============================================
// Customer App Types
// ============================================

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  birthday?: string | null;
  gender?: string | null;
  notes?: string | null;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerBooking {
  id: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  status: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  stylist?: {
    id: string;
    name: string;
  } | null;
  totalAmount: number;
  notes?: string | null;
}

export interface CustomerLoyaltyInfo {
  tier?: {
    id: string;
    name: string;
    discountPercent: number;
    perks?: any;
  } | null;
  totalPoints: number;
  lifetimePoints: number;
  nextTier?: {
    id: string;
    name: string;
    minSpend: number;
  } | null;
  pointsToNextTier: number;
  spendingLast6Months: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: "TIER_BASED" | "PERSONALIZED" | "SEASONAL" | "BIRTHDAY";
  discountPercent?: number;
  discountAmount?: number;
  validFrom: string;
  validTo: string;
  isRedeemed?: boolean;
  minPurchase?: number;
}

export interface MinaRecommendation {
  serviceId: string;
  serviceName: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface CustomerNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
  isRead: boolean;
}

