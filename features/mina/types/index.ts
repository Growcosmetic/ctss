// ============================================
// MINA Types
// ============================================

export interface CustomerSummary {
  customerId: string;
  basicInfo: {
    name: string;
    phone: string;
    totalVisits: number;
    totalSpent: number;
    lastVisitDate: string | null;
  };
  recentVisits: Array<{
    date: string;
    serviceName: string;
    amount: number;
  }>;
  spendingPattern: {
    averageSpending: number;
    trend: "increasing" | "decreasing" | "stable";
  };
  preferences: any;
  stylistPreference: {
    staffId: string;
    staffName: string;
    visitCount: number;
  } | null;
  warningFlags: string[];
}

export interface ReturnPrediction {
  customerId: string;
  predictedDate: string;
  confidenceScore: number; // 0-1
  reasoning: string;
}

export interface ServiceSuggestion {
  serviceId: string;
  serviceName: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface ChurnRisk {
  customerId: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  score: number; // 0-1
  reasons: string[];
}

export interface POSUpsellSuggestion {
  serviceId?: string;
  productId?: string;
  name: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface InvoiceDraft {
  items: Array<{
    serviceId?: string;
    productId?: string;
    name: string;
  }>;
  customerId?: string;
}

