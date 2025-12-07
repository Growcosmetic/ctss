// ============================================
// Inventory API Service
// ============================================

import {
  ProductStock,
  StockTransaction,
  LowStockAlert,
  UsageTrend,
  InventoryForecast,
} from "../types";

const API_BASE = "/api/inventory";

/**
 * GET /api/inventory/stock?branchId=xxx
 */
export async function getStockLevels(
  branchId: string
): Promise<ProductStock[]> {
  try {
    const response = await fetch(`${API_BASE}/stock?branchId=${branchId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      console.warn("Failed to get stock levels, returning empty array");
      return [];
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error getting stock levels:", error);
    return [];
  }
}

/**
 * GET /api/inventory/alerts?branchId=xxx
 */
export async function getLowStockAlerts(
  branchId: string
): Promise<LowStockAlert[]> {
  try {
    const response = await fetch(`${API_BASE}/alerts?branchId=${branchId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      console.warn("Failed to get alerts, returning empty array");
      return [];
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error getting alerts:", error);
    return [];
  }
}

/**
 * GET /api/inventory/transactions?branchId=xxx
 */
export async function getStockTransactions(
  branchId: string,
  limit?: number
): Promise<StockTransaction[]> {
  try {
    const params = new URLSearchParams({ branchId });
    if (limit) params.append("limit", limit.toString());
    const response = await fetch(`${API_BASE}/transactions?${params}`, {
      credentials: "include",
    });
    if (!response.ok) {
      console.warn("Failed to get transactions, returning empty array");
      return [];
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error getting transactions:", error);
    return [];
  }
}

/**
 * POST /api/inventory/stock-in
 */
export async function addStock(request: {
  productId: string;
  branchId: string;
  quantity: number;
  reason?: string;
  notes?: string;
}): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/stock-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add stock");
    }
  } catch (error) {
    console.error("Error adding stock:", error);
    throw error;
  }
}

/**
 * POST /api/inventory/stock-out
 */
export async function removeStock(request: {
  productId: string;
  branchId: string;
  quantity: number;
  reason?: string;
  reference?: string;
  notes?: string;
}): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/stock-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to remove stock");
    }
  } catch (error) {
    console.error("Error removing stock:", error);
    throw error;
  }
}

/**
 * POST /api/inventory/adjust
 */
export async function adjustStock(request: {
  productId: string;
  branchId: string;
  newQuantity: number;
  notes?: string;
}): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/adjust`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to adjust stock");
    }
  } catch (error) {
    console.error("Error adjusting stock:", error);
    throw error;
  }
}

/**
 * GET /api/inventory/trends?productId=xxx&branchId=xxx
 */
export async function getUsageTrends(
  productId: string,
  branchId: string,
  period?: "week" | "month"
): Promise<UsageTrend> {
  try {
    const params = new URLSearchParams({ productId, branchId });
    if (period) params.append("period", period);
    const response = await fetch(`${API_BASE}/trends?${params}`);
    if (!response.ok) {
      throw new Error("Failed to get trends");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting trends:", error);
    throw error;
  }
}

/**
 * GET /api/inventory/forecast?productId=xxx&branchId=xxx
 */
export async function getForecast(
  productId: string,
  branchId: string
): Promise<InventoryForecast> {
  try {
    const response = await fetch(
      `${API_BASE}/forecast?productId=${productId}&branchId=${branchId}`
    );
    if (!response.ok) {
      throw new Error("Failed to get forecast");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting forecast:", error);
    throw error;
  }
}

