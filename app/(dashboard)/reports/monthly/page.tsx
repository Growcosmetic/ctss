"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface MonthlyReport {
  id: string;
  reportMonth: number;
  reportYear: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  margin: number;
  revenueGrowth: number | null;
  costChange: number | null;
  totalCustomers: number;
  returningCustomers: number;
  newCustomers: number;
  returnRate: number | null;
  servicesByCategory: any;
  serviceProfit: any;
  serviceTrends: any;
  usageByCategory: any;
  stockIn: number;
  stockOut: number;
  endingStock: number;
  excessStock: any[];
  lowStockItems: any[];
  averageLossRate: number | null;
  lossChange: number | null;
  highLossProducts: any[];
  suspiciousStaff: any[];
  inventoryMismatch: number | null;
  topPerformers: any[];
  staffEfficiency: any[];
  staffWarnings: any[];
  costOptimization: any[];
  inventoryOptimization: any[];
  marketingSuggestions: any[];
  trainingNeeds: any[];
  aiSummary: string | null;
  generatedAt: string;
}

export default function MonthlyReportPage() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  useEffect(() => {
    loadReport();
  }, [selectedMonth, selectedYear]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/monthly/generate?month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error("Load report error:", err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/reports/monthly/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        alert("Đã tạo báo cáo tháng thành công!");
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
          <h1 className="text-3xl font-bold mb-2">
            📊 Monthly Summary Dashboard
          </h1>
          <p className="text-gray-600">Báo cáo tổng hợp tháng - CEO Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>
          <Button onClick={generateReport} disabled={generating}>
            {generating ? "⏳ Đang tạo..." : "✨ Tạo báo cáo"}
          </Button>
        </div>
      </div>

      {!report ? (
        <Card className="p-12 border text-center">
          <div className="text-gray-500 mb-4">
            Chưa có báo cáo cho tháng {selectedMonth}/{selectedYear}
          </div>
          <Button onClick={generateReport} disabled={generating}>
            {generating ? "⏳ Đang tạo..." : "✨ Tạo báo cáo"}
          </Button>
        </Card>
      ) : (
        <>
          {/* KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 border bg-blue-50">
              <div className="text-sm text-blue-700 mb-1">Doanh thu tháng</div>
              <div className="text-3xl font-bold text-blue-800">
                {report.totalRevenue.toLocaleString("vi-VN")}đ
              </div>
              {report.revenueGrowth !== null && (
                <div
                  className={`text-sm mt-2 ${
                    report.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {report.revenueGrowth >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(report.revenueGrowth).toFixed(1)}% so với tháng trước
                </div>
              )}
            </Card>
            <Card className="p-6 border bg-red-50">
              <div className="text-sm text-red-700 mb-1">Chi phí SP</div>
              <div className="text-3xl font-bold text-red-800">
                {report.totalCost.toLocaleString("vi-VN")}đ
              </div>
              {report.costChange !== null && (
                <div
                  className={`text-sm mt-2 ${
                    report.costChange <= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {report.costChange <= 0 ? "↓" : "↑"}{" "}
                  {Math.abs(report.costChange).toFixed(1)}% so với tháng trước
                </div>
              )}
            </Card>
            <Card className="p-6 border bg-green-50">
              <div className="text-sm text-green-700 mb-1">Lợi nhuận</div>
              <div className="text-3xl font-bold text-green-800">
                {report.profit.toLocaleString("vi-VN")}đ
              </div>
              <div className="text-sm mt-2 text-gray-600">
                Margin: {report.margin.toFixed(1)}%
              </div>
            </Card>
            <Card className="p-6 border bg-purple-50">
              <div className="text-sm text-purple-700 mb-1">
                Tỷ lệ khách quay lại
              </div>
              <div className="text-3xl font-bold text-purple-800">
                {report.returnRate?.toFixed(1) || 0}%
              </div>
              <div className="text-sm mt-2 text-gray-600">
                {report.returningCustomers}/{report.totalCustomers} khách
              </div>
            </Card>
          </div>

          {/* Service Performance */}
          <Card className="p-6 border">
            <h2 className="text-xl font-semibold mb-4">
              📋 Phân tích dịch vụ
            </h2>
            {report.serviceProfit && Object.keys(report.serviceProfit).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Dịch vụ</th>
                      <th className="border p-2 text-right">Doanh thu</th>
                      <th className="border p-2 text-right">Chi phí</th>
                      <th className="border p-2 text-right">Lợi nhuận</th>
                      <th className="border p-2 text-right">Margin</th>
                      <th className="border p-2 text-right">Xu hướng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(report.serviceProfit)
                      .sort(
                        (a: any, b: any) =>
                          b[1].revenue - a[1].revenue
                      )
                      .map(([serviceName, data]: [string, any]) => {
                        const trend =
                          report.serviceTrends?.[serviceName] || 0;
                        return (
                          <tr key={serviceName}>
                            <td className="border p-2 font-semibold">
                              {serviceName}
                            </td>
                            <td className="border p-2 text-right">
                              {data.revenue.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="border p-2 text-right">
                              {data.cost.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="border p-2 text-right font-semibold text-green-600">
                              {data.profit.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="border p-2 text-right">
                              {data.margin.toFixed(1)}%
                            </td>
                            <td
                              className={`border p-2 text-right ${
                                trend >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {trend >= 0 ? "↑" : "↓"}{" "}
                              {Math.abs(trend).toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu dịch vụ
              </div>
            )}
          </Card>

          {/* Product Usage */}
          <Card className="p-6 border">
            <h2 className="text-xl font-semibold mb-4">
              🧪 Sử dụng sản phẩm theo nhóm
            </h2>
            {report.usageByCategory &&
            Object.keys(report.usageByCategory).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(report.usageByCategory).map(
                  ([category, data]: [string, any]) => (
                    <div
                      key={category}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="font-semibold mb-2">{category}</div>
                      <div className="text-sm text-gray-600">
                        Chi phí: {data.cost.toLocaleString("vi-VN")}đ
                      </div>
                      <div className="text-sm text-gray-600">
                        Lượng dùng: {data.qty.toFixed(1)}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu
              </div>
            )}
          </Card>

          {/* Inventory Movement */}
          <Card className="p-6 border">
            <h2 className="text-xl font-semibold mb-4">
              📦 Dòng chảy tồn kho
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-700 mb-1">Nhập</div>
                <div className="text-2xl font-bold text-green-800">
                  {report.stockIn.toLocaleString("vi-VN")}đ
                </div>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-700 mb-1">Xuất</div>
                <div className="text-2xl font-bold text-red-800">
                  {report.stockOut.toLocaleString("vi-VN")}đ
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">Tồn cuối kỳ</div>
                <div className="text-2xl font-bold text-blue-800">
                  {report.endingStock.toLocaleString("vi-VN")}đ
                </div>
              </div>
            </div>

            {report.excessStock && report.excessStock.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold mb-2 text-orange-700">
                  ⚠️ Sản phẩm dư kho:
                </div>
                <div className="space-y-2">
                  {report.excessStock.slice(0, 5).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-orange-50 border border-orange-200 rounded"
                    >
                      {item.productName} - {item.currentStock}
                      {item.unit} (đủ dùng{" "}
                      {item.daysUntilEmpty
                        ? Math.round(item.daysUntilEmpty)
                        : "N/A"}{" "}
                      ngày)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Loss & Fraud */}
          <Card className="p-6 border">
            <h2 className="text-xl font-semibold mb-4">
              🔥 Hao hụt & Phát hiện gian lận
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 border rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Hao hụt trung bình
                </div>
                <div className="text-2xl font-bold">
                  {report.averageLossRate?.toFixed(1) || 0}%
                </div>
                {report.lossChange !== null && (
                  <div
                    className={`text-sm mt-2 ${
                      report.lossChange <= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {report.lossChange <= 0 ? "↓" : "↑"}{" "}
                    {Math.abs(report.lossChange).toFixed(1)}% so với tháng trước
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  Lệch tồn kho vs log
                </div>
                <div className="text-2xl font-bold">
                  {report.inventoryMismatch?.toFixed(1) || 0}%
                </div>
                {report.inventoryMismatch && report.inventoryMismatch > 5 && (
                  <div className="text-sm mt-2 text-red-600">
                    ⚠️ Cảnh báo: Lệch &gt; 5%
                  </div>
                )}
              </div>
            </div>

            {report.highLossProducts && report.highLossProducts.length > 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-2 text-red-700">
                  Sản phẩm hao hụt cao:
                </div>
                <div className="space-y-2">
                  {report.highLossProducts.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50 border border-red-200 rounded"
                    >
                      {item.productName}: {item.lossRate}%
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.suspiciousStaff && report.suspiciousStaff.length > 0 && (
              <div>
                <div className="font-semibold mb-2 text-orange-700">
                  ⚠️ Nhân viên nghi vấn:
                </div>
                <div className="space-y-2">
                  {report.suspiciousStaff.map((staff: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-orange-50 border border-orange-200 rounded"
                    >
                      {staff.staffName}: {staff.alertCount} cảnh báo (Fraud
                      Score: {staff.avgFraudScore?.toFixed(0) || "N/A"})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Staff Performance */}
          <Card className="p-6 border">
            <h2 className="text-xl font-semibold mb-4">
              ⭐ Bảng xếp hạng nhân viên
            </h2>
            {report.topPerformers && report.topPerformers.length > 0 ? (
              <div className="space-y-3">
                {report.topPerformers.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-blue-600">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-lg">
                          {p.staffName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Tiết kiệm: {p.efficiency.toFixed(1)}/dịch vụ
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {p.revenue.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu
              </div>
            )}
          </Card>

          {/* AI Recommendations */}
          {report.aiSummary && (
            <Card className="p-6 border bg-gradient-to-br from-blue-50 to-purple-50">
              <h2 className="text-xl font-semibold mb-4">🤖 AI Recommendations</h2>
              <div className="mb-4 p-4 bg-white rounded-lg border">
                <div className="font-semibold mb-2">Tóm tắt:</div>
                <div>{report.aiSummary}</div>
              </div>

              {report.costOptimization &&
                report.costOptimization.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold mb-2 text-green-700">
                      💰 Tối ưu chi phí:
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {report.costOptimization.map((opt: any, idx: number) => (
                        <li key={idx}>
                          <strong>[{opt.priority}]</strong> {opt.action} - Tiết
                          kiệm: {opt.savings}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {report.marketingSuggestions &&
                report.marketingSuggestions.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold mb-2 text-blue-700">
                      📢 Gợi ý Marketing:
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {report.marketingSuggestions.map(
                        (suggestion: any, idx: number) => (
                          <li key={idx}>
                            {suggestion.service}: {suggestion.suggestion}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {report.trainingNeeds && report.trainingNeeds.length > 0 && (
                <div>
                  <div className="font-semibold mb-2 text-purple-700">
                    📘 Nhu cầu đào tạo:
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {report.trainingNeeds.map((need: any, idx: number) => (
                      <li key={idx}>
                        <strong>{need.staff}</strong> - {need.area}: {need.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

