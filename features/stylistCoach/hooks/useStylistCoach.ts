// ============================================
// Stylist Coach React Hook
// ============================================

"use client";

import { useState } from "react";

export function useStylistCoach() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async (payload: {
    hairCondition: string;
    hairHistory: string;
    customerGoal: string;
    curlType: string;
    hairDamageLevel: string;
    stylistNote: string;
  }) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/stylist-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Phân tích thất bại");
      }

      const json = await res.json();
      setData(json);

      // SAVE TO DB
      await fetch("/api/stylist-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          resultJson: json
        })
      });

      return json;
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    analyze,
  };
}

