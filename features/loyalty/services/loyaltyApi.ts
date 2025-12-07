// ============================================
// Loyalty API Service
// ============================================

import {
  CustomerLoyalty,
  LoyaltyPoint,
  LoyaltySummary,
  RedeemPointsRequest,
} from "../types";

const API_BASE = "/api/loyalty";

/**
 * GET /api/loyalty/points
 */
export async function getLoyaltyPoints(
  customerId: string
): Promise<CustomerLoyalty> {
  try {
    const response = await fetch(`${API_BASE}/points?customerId=${customerId}`);
    if (!response.ok) {
      throw new Error("Failed to get loyalty points");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting loyalty points:", error);
    throw error;
  }
}

/**
 * GET /api/loyalty/history
 */
export async function getPointsHistory(
  customerId: string,
  limit?: number
): Promise<LoyaltyPoint[]> {
  try {
    const params = new URLSearchParams({ customerId });
    if (limit) params.append("limit", limit.toString());

    const response = await fetch(`${API_BASE}/history?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to get points history");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting points history:", error);
    throw error;
  }
}

/**
 * GET /api/loyalty/tier
 */
export async function getLoyaltyTier(
  customerId: string
): Promise<LoyaltySummary> {
  try {
    const response = await fetch(`${API_BASE}/tier?customerId=${customerId}`);
    if (!response.ok) {
      throw new Error("Failed to get loyalty tier");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting loyalty tier:", error);
    throw error;
  }
}

/**
 * POST /api/loyalty/redeem
 */
export async function redeemPoints(
  request: RedeemPointsRequest
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to redeem points");
    }
  } catch (error) {
    console.error("Error redeeming points:", error);
    throw error;
  }
}

