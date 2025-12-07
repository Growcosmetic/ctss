// ============================================
// Customer360 React Hook
// ============================================

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Customer360Payload,
  CustomerAIInsights,
  CustomerNBAAction,
} from "../types";

interface Customer360Data {
  customer360: Omit<Customer360Payload, "insights" | "nba">;
  insights: CustomerAIInsights;
  nba: CustomerNBAAction;
}

interface UseCustomer360Return {
  data: Customer360Data | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  insights: CustomerAIInsights | null;
  nba: CustomerNBAAction | null;
  customer360: Omit<Customer360Payload, "insights" | "nba"> | null;
}

export function useCustomer360(customerId: string): UseCustomer360Return {
  const [data, setData] = useState<Customer360Data | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!customerId) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/customer360/${customerId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to load customer 360 data (${response.status})`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to load customer 360 data");
      }

      setData(result.data);
    } catch (err: any) {
      console.error("Customer360 ERROR:", err);
      setError(err.message ?? "Error loading customer 360 data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Auto-load when customerId changes
  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh: load,
    insights: data?.insights ?? null,
    nba: data?.nba ?? null,
    customer360: data?.customer360 ?? null,
  };
}

