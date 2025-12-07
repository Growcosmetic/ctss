"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function StylistCoachDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stylist-analysis/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters)
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/stylist-analysis/insights");
      const data = await res.json();
      setInsights(data.insights || "");
    } catch (error) {
      console.error("Error loading insights:", error);
      setInsights("Không thể tải insights. Vui lòng thử lại sau.");
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Dashboard Phân tích Kỹ thuật</h1>
        <Button
          onClick={() => window.open("/api/stylist-analysis/export", "_blank")}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          📥 Xuất Excel
        </Button>
      </div>

      {/* DATE FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Từ ngày</label>
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Đến ngày</label>
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={loadData}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Lọc dữ liệu
            </Button>
          </div>
        </div>

        {/* Quick Range */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[
            { label: "7 ngày", days: 7 },
            { label: "30 ngày", days: 30 },
            { label: "90 ngày", days: 90 },
            { label: "Năm nay", days: "YTD" },
          ].map((range, i) => (
            <button
              key={i}
              onClick={() => {
                const now = new Date();
                let start = new Date();

                if (range.days === "YTD") {
                  start = new Date(now.getFullYear(), 0, 1);
                } else if (typeof range.days === "number") {
                  start.setDate(now.getDate() - range.days);
                }

                setFilters({
                  startDate: start.toISOString().split("T")[0],
                  endDate: now.toISOString().split("T")[0],
                });
              }}
              className="border border-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* STATS CARDS */}
      {loading ? (
        <div className="text-center py-8">⏳ Đang tải dữ liệu...</div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* RISK STATS */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">📊 Phân bố Rủi ro</h3>
            <div className="space-y-2">
              {Object.entries(stats.riskStats || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span>{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* DAMAGE STATS */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">⚠️ Mức độ Hư tổn</h3>
            <div className="space-y-2">
              {Object.entries(stats.damageStats || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span>{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* TIMELINE SUMMARY */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">📅 Timeline</h3>
            <div className="text-sm text-gray-600">
              {Object.keys(stats.timeline || {}).length} ngày có phân tích
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">Không có dữ liệu</div>
      )}

      {/* AI INSIGHTS */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🔮 AI Insights</h2>

        {!insights ? (
          <Button
            onClick={loadInsights}
            disabled={loadingInsights}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loadingInsights ? "⏳ Đang phân tích..." : "Phân tích Insights bằng AI"}
          </Button>
        ) : (
          <div className="whitespace-pre-line text-gray-800 text-sm bg-gray-50 p-4 rounded-lg border">
            {insights}
            <div className="mt-4">
              <Button
                onClick={loadInsights}
                disabled={loadingInsights}
                variant="outline"
                size="sm"
              >
                🔄 Làm mới
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

