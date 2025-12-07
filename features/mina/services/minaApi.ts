// ============================================
// MINA API Service
// ============================================

import {
  CustomerSummary,
  ReturnPrediction,
  ServiceSuggestion,
  ChurnRisk,
  POSUpsellSuggestion,
  InvoiceDraft,
} from "../types";

const API_BASE = "/api/mina";

/**
 * GET /api/mina/summary?customerId=xxx
 */
export async function getCustomerSummary(customerId: string): Promise<CustomerSummary> {
  try {
    const response = await fetch(`${API_BASE}/summary?customerId=${customerId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch customer summary");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching customer summary:", error);
    throw error;
  }
}

/**
 * GET /api/mina/predict-return?customerId=xxx
 */
export async function getPredictReturn(customerId: string): Promise<ReturnPrediction> {
  try {
    const response = await fetch(`${API_BASE}/predict-return?customerId=${customerId}`);
    if (!response.ok) {
      throw new Error("Failed to predict return date");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error predicting return date:", error);
    throw error;
  }
}

/**
 * GET /api/mina/suggest-services?customerId=xxx
 */
export async function getServiceSuggestions(customerId: string): Promise<ServiceSuggestion[]> {
  try {
    const response = await fetch(`${API_BASE}/suggest-services?customerId=${customerId}`);
    if (!response.ok) {
      throw new Error("Failed to get service suggestions");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching service suggestions:", error);
    throw error;
  }
}

/**
 * GET /api/mina/churn-risk?customerId=xxx
 */
export async function getChurnRisk(customerId: string): Promise<ChurnRisk> {
  try {
    const response = await fetch(`${API_BASE}/churn-risk?customerId=${customerId}`);
    if (!response.ok) {
      throw new Error("Failed to detect churn risk");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error detecting churn risk:", error);
    throw error;
  }
}

/**
 * POST /api/mina/pos-upsell
 */
export async function getPOSUpsellSuggestions(
  invoiceDraft: InvoiceDraft
): Promise<POSUpsellSuggestion[]> {
  try {
    const response = await fetch(`${API_BASE}/pos-upsell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceDraft),
    });

    if (!response.ok) {
      throw new Error("Failed to get POS upsell suggestions");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching POS upsell suggestions:", error);
    throw error;
  }
}

