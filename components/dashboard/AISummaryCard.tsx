"use client";

import { useState, useEffect } from "react";
import { Sparkles, AlertTriangle, CheckCircle, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AISummaryData {
  summary: string;
  risks: Array<{
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    impact: string;
  }>;
  suggestedActions: Array<{
    priority: "LOW" | "MEDIUM" | "HIGH";
    action: string;
    reason: string;
  }>;
}

interface AISummaryCardProps {
  period?: "day" | "week" | "month";
}

export default function AISummaryCard({ period = "day" }: AISummaryCardProps) {
  const [data, setData] = useState<AISummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [period]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ai/summary?period=${period}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data.summary);
        setGeneratedAt(result.data.generatedAt);
        setCached(result.data.cached || false);
      } else {
        setError(result.error || "Failed to load summary");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force refresh by adding timestamp
    const res = await fetch(`/api/ai/summary?period=${period}&_t=${Date.now()}`);
    const result = await res.json();

    if (result.success) {
      setData(result.data.summary);
      setGeneratedAt(result.data.generatedAt);
      setCached(false);
    }
    setRefreshing(false);
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-100 border-red-300 text-red-800";
      case "HIGH":
        return "bg-orange-100 border-orange-300 text-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "LOW":
        return "bg-blue-100 border-blue-300 text-blue-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-orange-600";
      case "LOW":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Operational Summary</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600">Đang tạo tóm tắt...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Operational Summary</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchSummary}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const periodLabel = period === "day" ? "ngày" : period === "week" ? "tuần" : "tháng";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Operational Summary</h3>
            <p className="text-sm text-gray-500">Tóm tắt hoạt động {periodLabel}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {cached && (
        <div className="mb-4 text-xs text-gray-500 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Đã lưu cache
        </div>
      )}

      {/* Summary */}
      <div className="mb-6">
        <div className="flex items-start gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-primary-600 mt-0.5" />
          <h4 className="font-semibold text-gray-900">Tóm tắt</h4>
        </div>
        <p className="text-gray-700 leading-relaxed">{data.summary}</p>
      </div>

      {/* Risks */}
      {data.risks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <h4 className="font-semibold text-gray-900">Rủi ro</h4>
          </div>
          <div className="space-y-2">
            {data.risks.map((risk, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${getSeverityColor(risk.level)}`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-medium text-xs uppercase">{risk.level}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{risk.description}</p>
                    <p className="text-xs opacity-90">{risk.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Actions */}
      {data.suggestedActions.length > 0 && (
        <div>
          <div className="flex items-start gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <h4 className="font-semibold text-gray-900">Hành động đề xuất</h4>
          </div>
          <div className="space-y-2">
            {data.suggestedActions.map((action, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-start gap-2">
                  <span className={`font-medium text-xs ${getPriorityColor(action.priority)}`}>
                    {action.priority}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{action.action}</p>
                    <p className="text-xs text-gray-600">{action.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.risks.length === 0 && data.suggestedActions.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Không có rủi ro hoặc hành động đề xuất
        </div>
      )}

      {generatedAt && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          Tạo lúc: {new Date(generatedAt).toLocaleString("vi-VN")}
        </div>
      )}
    </div>
  );
}

