"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";

export default function CRMDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedSegment, selectedTag, dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSegment) params.append("segment", selectedSegment);
      if (selectedTag) params.append("tag", selectedTag);
      if (dateRange.startDate)
        params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const res = await fetch(`/api/crm/dashboard?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error("Load dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    if (!data) return;
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/crm/dashboard/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboardData: data }),
      });
      const result = await res.json();
      if (result.success) {
        setInsights(result.insights);
      }
    } catch (err) {
      console.error("Load insights error:", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải dashboard...</div>
      </div>
    );
  }

  const { kpi, charts, topCustomers } = data;

  // Chart colors
  const COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 CRM Dashboard</h1>
          <p className="text-gray-600">
            Tổng quan 360° về khách hàng và hoạt động salon
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className="px-3 py-2 border rounded-lg text-sm"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
            className="px-3 py-2 border rounded-lg text-sm"
            placeholder="Đến ngày"
          />
          {(dateRange.startDate || dateRange.endDate) && (
            <Button
              onClick={() =>
                setDateRange({ startDate: "", endDate: "" })
              }
              variant="outline"
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-sm font-medium text-gray-700">
            Lọc theo Segment:
          </div>
          <button
            onClick={() => setSelectedSegment("")}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedSegment === ""
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setSelectedSegment("VIP");
              setSelectedTag("");
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedSegment === "VIP"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            VIP
          </button>
          <button
            onClick={() => {
              setSelectedSegment("Active");
              setSelectedTag("");
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedSegment === "Active"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setSelectedSegment("Overdue");
              setSelectedTag("");
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedSegment === "Overdue"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => {
              setSelectedSegment("Lost");
              setSelectedTag("");
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedSegment === "Lost"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Lost
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap mt-3">
          <div className="text-sm font-medium text-gray-700">
            Lọc theo Tag:
          </div>
          <button
            onClick={() => setSelectedTag("")}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedTag === ""
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setSelectedTag("Hay uốn");
              setSelectedSegment("");
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedTag === "Hay uốn"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Hay uốn
          </button>
          <button
            onClick={() => {
              setSelectedTag("Hay nhuộm");
              setSelectedSegment("");
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedTag === "Hay nhuộm"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Hay nhuộm
          </button>
          <button
            onClick={() => {
              setSelectedTag("Risky Hair");
              setSelectedSegment("");
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedTag === "Risky Hair"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Risky Hair
          </button>
        </div>
      </Card>

      {/* KPI Cards - Customer */}
      <div>
        <h2 className="text-xl font-semibold mb-4">📈 Chỉ số khách hàng</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl">
            <div className="text-2xl font-bold text-blue-700">
              {kpi.newCustomers}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Khách mới (30 ngày)
            </div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200 rounded-xl">
            <div className="text-2xl font-bold text-green-700">
              {kpi.returningCustomers}
            </div>
            <div className="text-sm text-gray-600 mt-1">Khách quay lại</div>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200 rounded-xl">
            <div className="text-2xl font-bold text-yellow-700">
              {kpi.overdueCustomers}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Overdue (60–90 ngày)
            </div>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200 rounded-xl">
            <div className="text-2xl font-bold text-red-700">
              {kpi.lostCustomers}
            </div>
            <div className="text-sm text-gray-600 mt-1">Lost khách</div>
          </Card>
          <Card className="p-4 bg-indigo-50 border-indigo-200 rounded-xl">
            <div className="text-2xl font-bold text-indigo-700">
              {kpi.activeCustomers}
            </div>
            <div className="text-sm text-gray-600 mt-1">Active khách</div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200 rounded-xl">
            <div className="text-2xl font-bold text-purple-700">
              {kpi.avgVisitInterval}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Tần suất TB (ngày)
            </div>
          </Card>
          <Card className="p-4 bg-pink-50 border-pink-200 rounded-xl">
            <div className="text-2xl font-bold text-pink-700">
              {kpi.aov?.toLocaleString("vi-VN")}₫
            </div>
            <div className="text-sm text-gray-600 mt-1">AOV trung bình</div>
          </Card>
          <Card className="p-4 bg-teal-50 border-teal-200 rounded-xl">
            <div className="text-2xl font-bold text-teal-700">
              {kpi.totalCustomers}
            </div>
            <div className="text-sm text-gray-600 mt-1">Tổng khách hàng</div>
          </Card>
        </div>
      </div>

      {/* Revenue KPI */}
      <div>
        <h2 className="text-xl font-semibold mb-4">💰 Chỉ số doanh thu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-green-50 border-green-200 rounded-xl">
            <div className="text-2xl font-bold text-green-700">
              {kpi.monthlyRevenue?.toLocaleString("vi-VN")}₫
            </div>
            <div className="text-sm text-gray-600 mt-1">Doanh thu tháng này</div>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl">
            <div className="text-2xl font-bold text-blue-700">
              {kpi.totalRevenue?.toLocaleString("vi-VN")}₫
            </div>
            <div className="text-sm text-gray-600 mt-1">Tổng doanh thu</div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200 rounded-xl">
            <div className="text-2xl font-bold text-purple-700">
              {kpi.reminderOpenRate}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Tỉ lệ mở reminder</div>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth Chart */}
        <Card className="p-6 border">
          <h3 className="text-lg font-semibold mb-4">
            📈 Tăng trưởng khách hàng (12 tháng)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="newCustomers"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Khách mới"
              />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#10b981"
                strokeWidth={2}
                name="Lượt đến"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6 border">
          <h3 className="text-lg font-semibold mb-4">
            💰 Doanh thu (12 tháng)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) =>
                  `${(value / 1000000).toFixed(1)}M`
                }
              />
              <Tooltip
                formatter={(value: any) =>
                  `${value.toLocaleString("vi-VN")}₫`
                }
              />
              <Bar dataKey="revenue" fill="#10b981" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Services */}
        <Card className="p-6 border">
          <h3 className="text-lg font-semibold mb-4">
            🔥 Top dịch vụ được sử dụng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={kpi.topServices}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" name="Số lượng" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Stylists */}
        <Card className="p-6 border">
          <h3 className="text-lg font-semibold mb-4">
            💇 Top Stylist theo doanh thu
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpi.topStylists}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  `${(value / 1000000).toFixed(1)}M`
                }
              />
              <Tooltip
                formatter={(value: any) =>
                  `${value.toLocaleString("vi-VN")}₫`
                }
              />
              <Bar dataKey="revenue" fill="#8b5cf6" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Service KPI */}
      <div>
        <h2 className="text-xl font-semibold mb-4">✂️ Chỉ số dịch vụ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-pink-50 border-pink-200 rounded-xl">
            <div className="text-2xl font-bold text-pink-700">
              {kpi.curlCustomers}
            </div>
            <div className="text-sm text-gray-600 mt-1">Khách hay uốn</div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200 rounded-xl">
            <div className="text-2xl font-bold text-purple-700">
              {kpi.colorCustomers}
            </div>
            <div className="text-sm text-gray-600 mt-1">Khách hay nhuộm</div>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200 rounded-xl">
            <div className="text-2xl font-bold text-blue-700">
              {kpi.topServices?.[0]?.count || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {kpi.topServices?.[0]?.name || "Dịch vụ phổ biến"}
            </div>
          </Card>
        </div>
      </div>

      {/* AI Insights Panel */}
      <Card className="p-6 border bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900">
            🤖 AI Customer Insights
          </h3>
          <Button
            onClick={loadAIInsights}
            disabled={loadingInsights}
            variant="outline"
          >
            {loadingInsights ? "⏳ Đang phân tích..." : "🔄 Tạo Insights"}
          </Button>
        </div>

        {insights ? (
          <div className="space-y-4">
            {/* Overall Insight */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-medium text-gray-900 mb-2">
                📊 Phân tích tổng quan:
              </div>
              <div className="text-sm text-gray-700">{insights.overallInsight}</div>
            </div>

            {/* Key Findings */}
            {insights.keyFindings && insights.keyFindings.length > 0 && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="font-medium text-gray-900 mb-2">
                  🔍 Key Findings:
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {insights.keyFindings.map((finding: string, i: number) => (
                    <li key={i}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Churn Risk */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Churn Risk:</div>
                <div
                  className={`text-lg font-bold ${
                    insights.churnRisk === "HIGH"
                      ? "text-red-600"
                      : insights.churnRisk === "MEDIUM"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {insights.churnRisk}
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Growth Trend:</div>
                <div
                  className={`text-lg font-bold ${
                    insights.growthTrend === "INCREASING"
                      ? "text-green-600"
                      : insights.growthTrend === "DECREASING"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {insights.growthTrend === "INCREASING"
                    ? "📈 Tăng"
                    : insights.growthTrend === "DECREASING"
                    ? "📉 Giảm"
                    : "➡️ Ổn định"}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {insights.recommendations &&
              insights.recommendations.length > 0 && (
                <div className="p-4 bg-white rounded-lg border">
                  <div className="font-medium text-gray-900 mb-3">
                    💡 Recommendations:
                  </div>
                  <div className="space-y-3">
                    {insights.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="border-l-4 border-blue-500 pl-3">
                        <div className="font-medium text-sm text-gray-900">
                          {rec.action}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {rec.reason}
                        </div>
                        <div className="text-xs mt-1">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              rec.priority === "HIGH"
                                ? "bg-red-100 text-red-700"
                                : rec.priority === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {rec.priority} Priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Next Best Actions */}
            {insights.nextBestActions &&
              insights.nextBestActions.length > 0 && (
                <div className="p-4 bg-white rounded-lg border">
                  <div className="font-medium text-gray-900 mb-2">
                    🎯 Next Best Actions:
                  </div>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {insights.nextBestActions.map((action: string, i: number) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Click "🔄 Tạo Insights" để AI phân tích dashboard data
          </div>
        )}
      </Card>

      {/* Top Customers */}
      <Card className="p-6 border">
        <h3 className="text-lg font-semibold mb-4">
          ⭐ Top 10 Khách hàng VIP
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium">Tên</th>
                <th className="text-left p-3 text-sm font-medium">SĐT</th>
                <th className="text-right p-3 text-sm font-medium">
                  Tổng chi tiêu
                </th>
                <th className="text-right p-3 text-sm font-medium">
                  Số lần đến
                </th>
                <th className="text-left p-3 text-sm font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c: any) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Link
                      href={`/customers/${c.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{c.phone}</td>
                  <td className="p-3 text-right font-medium">
                    {c.totalSpent?.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="p-3 text-right">{c.totalVisits}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {c.tags?.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

