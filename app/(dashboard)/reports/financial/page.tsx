"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Card } from "@/components/ui/Card";
import { Loader2, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function FinancialDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodStart, setPeriodStart] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadData();
  }, [periodStart, periodEnd]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("periodStart", periodStart);
      params.append("periodEnd", periodEnd);

      const res = await fetch(`/api/financial/dashboard?${params.toString()}`);
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Không thể tải dữ liệu");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER]}>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER]}>
        <MainLayout>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Lỗi: {error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  const { overview, cashflow, breakdowns, trends, forecasts, alerts } = data || {};

  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER]}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Báo cáo Tài chính</h1>
              <p className="text-gray-600 mt-1">Phân tích tài chính chi tiết</p>
            </div>
            <div className="flex gap-4">
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Làm mới
              </button>
            </div>
          </div>

          {/* Overview Cards */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.totalRevenue?.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lợi nhuận gộp</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.grossProfit?.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Biên: {overview.grossMargin}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lợi nhuận ròng</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.netProfit?.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Biên: {overview.netMargin}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng chi phí</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.totalExpenses?.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      COGS: {overview.totalCOGS?.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </Card>
            </div>
          )}

          {/* Cashflow */}
          {cashflow && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Dòng tiền</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng thu</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {cashflow.totalInflow?.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng chi</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {cashflow.totalOutflow?.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${
                  cashflow.netCashflow >= 0 ? "bg-blue-50" : "bg-orange-50"
                }`}>
                  <p className="text-sm text-gray-600">Dòng tiền ròng</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    cashflow.netCashflow >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}>
                    {cashflow.netCashflow?.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trends?.revenueChart && trends.revenueChart.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Xu hướng Doanh thu</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => value.toLocaleString("vi-VN") + " đ"} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {breakdowns?.expensesByCategory && Object.keys(breakdowns.expensesByCategory).length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Chi phí theo danh mục</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(breakdowns.expensesByCategory).map(([key, value]: [string, any]) => ({
                        name: key,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(breakdowns.expensesByCategory).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => value.toLocaleString("vi-VN") + " đ"} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Alerts */}
          {alerts && alerts.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Cảnh báo Tài chính ({alerts.length})
              </h2>
              <div className="space-y-3">
                {alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-50 border-red-500"
                        : alert.severity === "HIGH"
                        ? "bg-orange-50 border-orange-500"
                        : "bg-yellow-50 border-yellow-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{alert.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        {alert.recommendations && (
                          <p className="text-sm text-blue-600 mt-2">
                            💡 {alert.recommendations}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-200 text-red-800"
                          : alert.severity === "HIGH"
                          ? "bg-orange-200 text-orange-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
