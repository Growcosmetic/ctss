"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DailyReport {
  id: string;
  reportDate: string;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  margin: number;
  totalServices: number;
  servicesByCategory: any;
  topServices: any[];
  productsUsed: any[];
  unusualUsage: any[];
  lowStockItems: any[];
  highLossProducts: any[];
  topPerformers: any[];
  staffWarnings: any[];
  strengths: string[];
  risks: any[];
  predictions: string[];
  recommendations: any[];
  aiAnalysis: string | null;
  generatedAt: string;
}

export default function DailyReportPage() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadReport();
  }, [selectedDate]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/daily/generate?date=${selectedDate}`
      );
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error("Load report error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/reports/daily/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });

      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        alert("Đã tạo báo cáo thành công!");
      } else {
        alert("Có lỗi: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Generate report error:", err);
      alert("Có lỗi xảy ra");
    } finally {
      setGenerating(false);
    }
  };

  const deliverReport = async (methods: string[]) => {
    if (!report) return;

    try {
      const res = await fetch("/api/reports/daily/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          methods,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Đã gửi báo cáo qua: ${methods.join(", ")}`);
        loadReport(); // Reload to update delivery status
      }
    } catch (err) {
      console.error("Deliver report error:", err);
      alert("Có lỗi xảy ra");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Daily Closing Report</h1>
          <p className="text-gray-600">
            Báo cáo cuối ngày tự động - BossMode
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <Button onClick={generateReport} disabled={generating}>
            {generating ? "⏳ Đang tạo..." : "✨ Tạo báo cáo"}
          </Button>
        </div>
      </div>

      {!report ? (
        <Card className="p-12 border text-center">
          <div className="text-gray-500 mb-4">
            Chưa có báo cáo cho ngày {new Date(selectedDate).toLocaleDateString("vi-VN")}
          </div>
          <Button onClick={generateReport} disabled={generating}>
            {generating ? "⏳ Đang tạo..." : "✨ Tạo báo cáo"}
          </Button>
        </Card>
      ) : (
        <>
          {/* Revenue & Profit */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 border bg-blue-50">
              <div className="text-sm text-blue-700 mb-1">Doanh thu</div>
              <div className="text-3xl font-bold text-blue-800">
                {report.totalRevenue.toLocaleString("vi-VN")}đ
              </div>
            </Card>
            <Card className="p-6 border bg-red-50">
              <div className="text-sm text-red-700 mb-1">Chi phí SP</div>
              <div className="text-3xl font-bold text-red-800">
                {report.totalCost.toLocaleString("vi-VN")}đ
              </div>
            </Card>
            <Card className="p-6 border bg-green-50">
              <div className="text-sm text-green-700 mb-1">Lợi nhuận</div>
              <div className="text-3xl font-bold text-green-800">
                {report.profit.toLocaleString("vi-VN")}đ
              </div>
            </Card>
            <Card className="p-6 border bg-purple-50">
              <div className="text-sm text-purple-700 mb-1">Margin</div>
              <div className="text-3xl font-bold text-purple-800">
                {report.margin.toFixed(1)}%
              </div>
            </Card>
          </div>

          {/* Services Summary */}
          <Card className="p-6 border">
            <h2 className="text-xl font-semibold mb-4">📋 Dịch vụ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  Tổng số dịch vụ: <strong>{report.totalServices}</strong>
                </div>
                {report.servicesByCategory && (
                  <div className="space-y-2">
                    {Object.entries(report.servicesByCategory).map(
                      ([category, count]: [string, any]) => (
                        <div
                          key={category}
                          className="flex justify-between p-2 bg-gray-50 rounded"
                        >
                          <span>{category}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Top dịch vụ:</div>
                {report.topServices && report.topServices.length > 0 ? (
                  <div className="space-y-2">
                    {report.topServices.map((s: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between p-2 bg-gray-50 rounded"
                      >
                        <span>{s.name}</span>
                        <span className="font-semibold">{s.count} lần</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">Chưa có dữ liệu</div>
                )}
              </div>
            </div>
          </Card>

          {/* Low Stock & High Loss */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.lowStockItems && report.lowStockItems.length > 0 && (
              <Card className="p-6 border border-orange-300">
                <h2 className="text-xl font-semibold mb-4 text-orange-800">
                  ⚠️ Sản phẩm sắp hết
                </h2>
                <div className="space-y-2">
                  {report.lowStockItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-orange-50 rounded border border-orange-200"
                    >
                      <div className="font-semibold">{item.productName}</div>
                      <div className="text-sm text-gray-600">
                        Còn {item.currentStock}
                        {item.unit} - Dự hết trong{" "}
                        {item.daysUntilEmpty
                          ? Math.round(item.daysUntilEmpty)
                          : "N/A"}{" "}
                        ngày
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {report.highLossProducts &&
              report.highLossProducts.length > 0 && (
                <Card className="p-6 border border-red-300">
                  <h2 className="text-xl font-semibold mb-4 text-red-800">
                    🔥 Hao hụt cao
                  </h2>
                  <div className="space-y-2">
                    {report.highLossProducts.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-50 rounded border border-red-200"
                      >
                        <div className="font-semibold">{item.productName}</div>
                        <div className="text-sm text-gray-600">
                          Hao hụt: {item.lossRate}%
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
          </div>

          {/* Staff Performance */}
          {report.topPerformers && report.topPerformers.length > 0 && (
            <Card className="p-6 border">
              <h2 className="text-xl font-semibold mb-4">⭐ Top Stylist</h2>
              <div className="space-y-2">
                {report.topPerformers.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-blue-600">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-lg">{p.name}</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {p.revenue.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI Insights */}
          {report.aiAnalysis && (
            <Card className="p-6 border bg-gradient-to-br from-blue-50 to-purple-50">
              <h2 className="text-xl font-semibold mb-4">🤖 AI Insights</h2>
              <div className="mb-4 p-4 bg-white rounded-lg border">
                <div className="font-semibold mb-2">Tóm tắt:</div>
                <div>{report.aiAnalysis}</div>
              </div>

              {report.strengths && report.strengths.length > 0 && (
                <div className="mb-4">
                  <div className="font-semibold mb-2 text-green-700">
                    ✅ Điểm mạnh:
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {report.strengths.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.risks && report.risks.length > 0 && (
                <div className="mb-4">
                  <div className="font-semibold mb-2 text-red-700">
                    ⚠️ Rủi ro:
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {report.risks.map((r: any, idx: number) => (
                      <li key={idx}>
                        [{r.severity}] {r.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.predictions && report.predictions.length > 0 && (
                <div className="mb-4">
                  <div className="font-semibold mb-2 text-blue-700">
                    🔮 Dự báo:
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {report.predictions.map((p: string, idx: number) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.recommendations &&
                report.recommendations.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2 text-purple-700">
                      💡 Đề xuất hành động:
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {report.recommendations.map((r: any, idx: number) => (
                        <li key={idx}>
                          <strong>[{r.priority}]</strong> {r.action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </Card>
          )}

          {/* Delivery Actions */}
          <Card className="p-6 border">
            <h2 className="text-xl font-semibold mb-4">📤 Gửi báo cáo</h2>
            <div className="flex gap-4">
              <Button
                onClick={() => deliverReport(["email"])}
                variant="outline"
              >
                📧 Gửi Email
              </Button>
              <Button
                onClick={() => deliverReport(["zalo"])}
                variant="outline"
              >
                💬 Gửi Zalo
              </Button>
              <Button
                onClick={() => deliverReport(["notification"])}
                variant="outline"
              >
                🔔 Gửi Notification
              </Button>
              <Button
                onClick={() => deliverReport(["email", "zalo", "notification"])}
                className="bg-blue-600"
              >
                ✉️ Gửi tất cả
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Đã tạo lúc:{" "}
              {new Date(report.generatedAt).toLocaleString("vi-VN")}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

