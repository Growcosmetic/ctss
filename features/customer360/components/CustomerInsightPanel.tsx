"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface CustomerInsightPanelProps {
  customerId?: string;
  phone?: string;
}

export function CustomerInsightPanel({
  customerId,
  phone,
}: CustomerInsightPanelProps) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInsight = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customer/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate insight");
      }

      setInsight(data.insight);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId || phone) {
      loadInsight();
    }
  }, [customerId, phone]);

  if (loading) {
    return (
      <Card className="p-6 border">
        <div className="text-center py-8">
          <div className="text-2xl mb-2">🔮</div>
          <div className="text-gray-600">AI đang phân tích insight...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border bg-red-50">
        <div className="text-red-600 mb-4">Lỗi: {error}</div>
        <Button onClick={loadInsight} variant="outline">
          Thử lại
        </Button>
      </Card>
    );
  }

  if (!insight) {
    return (
      <Card className="p-6 border">
        <div className="text-center py-4">
          <div className="text-gray-500 mb-4">Chưa có insight</div>
          <Button onClick={loadInsight}>Tạo Insight</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {insight.summary && (
        <Card className="p-6 border bg-gradient-to-br from-indigo-50 to-purple-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-indigo-600">📊</span> Tóm tắt Insight
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {insight.summary}
          </p>
        </Card>
      )}

      {/* Metrics */}
      {(insight.loyaltyScore !== undefined ||
        insight.churnProbability !== undefined) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insight.loyaltyScore !== undefined && (
            <Card className="p-4 border bg-blue-50">
              <div className="text-sm text-gray-600 mb-1">Loyalty Score</div>
              <div className="text-2xl font-bold text-blue-700">
                {insight.loyaltyScore}/100
              </div>
            </Card>
          )}
          {insight.churnProbability !== undefined && (
            <Card className="p-4 border bg-red-50">
              <div className="text-sm text-gray-600 mb-1">
                Churn Probability
              </div>
              <div className="text-2xl font-bold text-red-700">
                {insight.churnProbability}%
              </div>
            </Card>
          )}
          {insight.nextVisitPrediction && (
            <Card className="p-4 border bg-green-50">
              <div className="text-sm text-gray-600 mb-1">
                Dự đoán quay lại
              </div>
              <div className="text-lg font-bold text-green-700">
                {new Date(insight.nextVisitPrediction).toLocaleDateString(
                  "vi-VN"
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Preferences */}
      {insight.preferences && insight.preferences.length > 0 && (
        <Card className="p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-blue-600">💙</span> Sở thích
          </h3>
          <ul className="space-y-2">
            {insight.preferences.map((p: string, i: number) => (
              <li
                key={i}
                className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200"
              >
                • {p}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Patterns */}
      {insight.patterns && insight.patterns.length > 0 && (
        <Card className="p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-purple-600">📈</span> Hành vi & Thói quen
          </h3>
          <ul className="space-y-2">
            {insight.patterns.map((p: string, i: number) => (
              <li
                key={i}
                className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg border border-purple-200"
              >
                • {p}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Risks */}
      {insight.risks && insight.risks.length > 0 && (
        <Card className="p-6 border bg-red-50">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <span className="text-red-600">⚠️</span> Rủi ro
          </h3>
          <div className="space-y-3">
            {insight.risks.map((risk: any, i: number) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg border border-red-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-900">{risk.type}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      risk.level === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : risk.level === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {risk.level}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                {risk.suggestion && (
                  <p className="text-xs text-blue-600">
                    💡 Gợi ý: {risk.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Opportunities */}
      {insight.opportunities && insight.opportunities.length > 0 && (
        <Card className="p-6 border bg-green-50">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
            <span className="text-green-600">🟢</span> Cơ hội Upsell
          </h3>
          <div className="space-y-3">
            {insight.opportunities.map((opp: any, i: number) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg border border-green-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">
                    {opp.title}
                  </span>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        opp.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : opp.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {opp.priority}
                    </span>
                    <span className="text-xs text-gray-500">{opp.type}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {opp.description}
                </p>
                {opp.estimatedValue > 0 && (
                  <p className="text-xs text-green-600 font-semibold">
                    💰 Giá trị ước tính: {opp.estimatedValue.toLocaleString("vi-VN")}₫
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {insight.recommendations && insight.recommendations.length > 0 && (
        <Card className="p-6 border bg-amber-50">
          <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <span className="text-amber-600">💡</span> Gợi ý Hành động
          </h3>
          <div className="space-y-3">
            {insight.recommendations.map((rec: any, i: number) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg border border-amber-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-amber-900">
                    {rec.title}
                  </span>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        rec.urgency === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : rec.urgency === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {rec.urgency}
                    </span>
                    <span className="text-xs text-gray-500">
                      {rec.category}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{rec.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Financial Segment */}
      {insight.financialSegment && (
        <Card className="p-6 border bg-indigo-50">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <span className="text-indigo-600">💰</span> Phân khúc Tài chính
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Phân khúc</div>
              <div className="text-lg font-bold text-indigo-700">
                {insight.financialSegment.segment}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">
                Chi tiêu trung bình
              </div>
              <div className="text-lg font-bold text-indigo-700">
                {insight.financialSegment.avgSpend?.toLocaleString("vi-VN") || 0}₫
              </div>
            </div>
            {insight.financialSegment.lifetimeValue > 0 && (
              <div className="bg-white p-4 rounded-lg border md:col-span-2">
                <div className="text-sm text-gray-600 mb-1">
                  Lifetime Value
                </div>
                <div className="text-xl font-bold text-indigo-700">
                  {insight.financialSegment.lifetimeValue.toLocaleString("vi-VN")}₫
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button onClick={loadInsight} variant="outline">
          🔄 Refresh Insight
        </Button>
      </div>
    </div>
  );
}

