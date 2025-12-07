// ============================================
// Customer360 Type Definitions
// ============================================

export interface Customer360Core {
  id: string;
  name: string;
  phone: string;
  gender?: string;
  birthday?: string | null;
  notes?: string | null;
  journeyState?: "AWARENESS" | "CONSIDERATION" | "BOOKING" | "IN_SALON" | "POST_SERVICE" | "RETENTION";
  createdAt: string;
}

export interface CustomerBookingHistory {
  id: string;
  date: string;
  serviceName?: string;
  stylistName?: string;
  branchName?: string;
  status: string;
}

export interface CustomerInvoiceHistory {
  id: string;
  date: string;
  total: number;
  branchName: string;
  items: {
    id: string;
    name: string;
    type: "SERVICE" | "PRODUCT";
    amount: number;
  }[];
}

export interface CustomerProductHistory {
  id: string;
  name: string;
  category: string;
  purchasedAt: string;
  invoiceId: string;
}

export interface CustomerLoyaltyInfo {
  tier?: string;
  totalPoints: number;
  lifetimePoints: number;
  nextTier?: string;
  progressPercent?: number;
}

export interface CustomerVisitFrequency {
  totalVisits: number;
  avgVisitInterval: number | null;
  lastVisit?: string | null;
  nextPredictedVisit?: string | null;
}

export interface CustomerServicePattern {
  serviceId: string;
  serviceName: string;
  count: number;
}

export interface CustomerAIInsights {
  persona: string;
  returnLikelihood: number;
  churnRisk: "LOW" | "MEDIUM" | "HIGH";
  predictedNextVisit: string | null;
  nextService?: string | null;
  nextProduct?: string | null;
  lifetimeValue?: number | null;
  cluster: string;
  insightSummary: string;
}

export interface CustomerNBAAction {
  stylistAdvice: string;
  receptionistAdvice: string;
  marketingAdvice: string;
  managerAdvice: string;
  priorityLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface Customer360Payload {
  core: Customer360Core;
  bookingHistory: CustomerBookingHistory[];
  invoiceHistory: CustomerInvoiceHistory[];
  productHistory: CustomerProductHistory[];
  loyalty: CustomerLoyaltyInfo;
  visitFrequency: CustomerVisitFrequency;
  servicePatterns: CustomerServicePattern[];
  branchVisits: Record<string, number>;
  crmNotes: string[];
  complaints: string[];
  insights: CustomerAIInsights;
  nba: CustomerNBAAction;
}

