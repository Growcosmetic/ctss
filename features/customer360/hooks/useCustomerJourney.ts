"use client";

import { useState, useCallback } from "react";

export interface UseCustomerJourneyResult {
  loading: boolean;
  error: string | null;
  transitionState: (customerId: string, event: string) => Promise<boolean>;
}

export function useCustomerJourney(): UseCustomerJourneyResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transitionState = useCallback(
    async (customerId: string, event: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/customer/journey/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, event }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to transition state");
        }

        return true;
      } catch (err: any) {
        setError(err.message || "Unknown error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    transitionState,
  };
}

