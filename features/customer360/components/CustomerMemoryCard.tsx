"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface CustomerMemoryCardProps {
  customerId: string;
}

export function CustomerMemoryCard({ customerId }: CustomerMemoryCardProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customer/memory/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load memory summary");
      }

      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [customerId]);

  if (loading) {
    return (
      <Card className="p-6 border">
        <div className="text-center py-4">⏳ Đang phân tích trí nhớ AI...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border bg-red-50">
        <div className="text-red-600">Lỗi: {error}</div>
        <Button onClick={loadSummary} className="mt-2">
          Thử lại
        </Button>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="p-6 border">
        <div className="text-gray-500 text-center">Chưa có dữ liệu trí nhớ</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-indigo-600">🧠</span> AI Memory Summary
        </h3>
        <Button onClick={loadSummary} variant="outline" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {/* Summary */}
      {summary.summary && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-indigo-200">
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {summary.summary}
          </p>
        </div>
      )}

      {/* Key Insights */}
      {summary.keyInsights && summary.keyInsights.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">
            💡 Key Insights
          </h4>
          <ul className="space-y-1">
            {summary.keyInsights.map((insight: string, i: number) => (
              <li
                key={i}
                className="text-sm text-gray-700 bg-white p-2 rounded border"
              >
                • {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {summary.recommendations && summary.recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">
            🎯 Recommendations
          </h4>
          <div className="space-y-2">
            {summary.recommendations.map((rec: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-white rounded-lg border border-indigo-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {rec.title}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      rec.priority === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : rec.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{rec.description}</p>
                <span className="text-xs text-indigo-600 mt-1 inline-block">
                  {rec.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Signals */}
      {summary.riskSignals && summary.riskSignals.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-gray-800 mb-2">
            ⚠️ Risk Signals
          </h4>
          <div className="space-y-2">
            {summary.riskSignals.map((risk: any, i: number) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${
                  risk.level === "HIGH"
                    ? "bg-red-50 border-red-200"
                    : risk.level === "MEDIUM"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{risk.type}</span>
                  <span className="text-xs font-semibold">{risk.level}</span>
                </div>
                <p className="text-xs text-gray-700">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

