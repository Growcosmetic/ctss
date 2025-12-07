// ============================================
// Loyalty System Types
// ============================================

export interface LoyaltyPoint {
  id: string;
  customerId: string;
  invoiceId?: string | null;
  points: number;
  description?: string | null;
  createdAt: Date;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minSpend: number;
  discountPercent: number;
  perks?: any;
  order: number;
}

export interface CustomerLoyalty {
  id: string;
  customerId: string;
  tierId?: string | null;
  totalPoints: number;
  lifetimePoints: number;
  updatedAt: Date;
  tier?: LoyaltyTier | null;
}

export interface LoyaltySummary {
  customerLoyalty: CustomerLoyalty;
  currentTier: LoyaltyTier | null;
  nextTier: LoyaltyTier | null;
  pointsToNextTier: number;
  spendingLast6Months: number;
  pointsHistory: LoyaltyPoint[];
}

export interface TierBenefits {
  discountPercent: number;
  perks: string[];
}

export interface RedeemPointsRequest {
  customerId: string;
  points: number;
  description?: string;
}

