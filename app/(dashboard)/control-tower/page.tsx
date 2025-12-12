"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Card } from "@/components/ui/Card";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, DollarSign, Calendar, BarChart3 } from "lucide-react";
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

export default function ControlTowerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [branchId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (branchId) params.append("branchId", branchId);

      const res = await fetch(`/api/control-tower/dashboard?${params.toString()}`);
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
      <RoleGuard roles={[CTSSRole.ADMIN]}>
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
      <RoleGuard roles={[CTSSRole.ADMIN]}>
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

  const { kpi, predictions, financial, branches, quality, staff, alerts } = data || {};

  return (
    <RoleGuard roles={[CTSSRole.ADMIN]}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CEO Control Tower</h1>
              <p className="text-gray-600 mt-1">Dashboard tổng quan toàn hệ thống</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Làm mới
            </button>
          </div>

          {/* KPI Cards */}
          {kpi && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Doanh thu hôm nay</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.revenueToday?.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Doanh thu tháng này</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.revenueThisMonth?.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lợi nhuận tháng</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.profitThisMonth?.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Biên lợi nhuận: {kpi.profitMargin}%
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lịch hẹn hôm nay</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.bookingsToday}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Tổng tháng: {kpi.bookingsThisMonth}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đánh giá trung bình</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.avgRating?.toFixed(1)}/5
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-yellow-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tỷ lệ upsale</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.upsaleRate?.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tỷ lệ khách quay lại</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.returnCustomerRate?.toFixed(1)}%
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nhân viên</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.staffStatus?.available}/{kpi.staffStatus?.total}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Đang bận: {kpi.staffStatus?.busy}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
              </Card>
            </div>
          )}

          {/* Financial Panel */}
          {financial && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Tài chính</h2>
                {financial.profit && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lợi nhuận gộp:</span>
                      <span className="font-semibold">
                        {financial.profit.grossProfit?.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lợi nhuận ròng:</span>
                      <span className="font-semibold">
                        {financial.profit.netProfit?.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biên lợi nhuận gộp:</span>
                      <span className="font-semibold">{financial.profit.grossMargin}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biên lợi nhuận ròng:</span>
                      <span className="font-semibold">{financial.profit.netMargin}%</span>
                    </div>
                  </div>
                )}
                {financial.cashflow && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <h3 className="font-semibold mb-2">Dòng tiền</h3>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng thu:</span>
                      <span className="font-semibold text-green-600">
                        {financial.cashflow.totalInflow?.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng chi:</span>
                      <span className="font-semibold text-red-600">
                        {financial.cashflow.totalOutflow?.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dòng tiền ròng:</span>
                      <span className={`font-semibold ${
                        financial.cashflow.netCashflow >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {financial.cashflow.netCashflow?.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Chi phí theo danh mục</h2>
                {financial.expensesByCategory && Object.keys(financial.expensesByCategory).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(financial.expensesByCategory).map(([key, value]: [string, any]) => ({
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
                        {Object.entries(financial.expensesByCategory).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => value.toLocaleString("vi-VN") + " đ"} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
                )}
              </Card>
            </div>
          )}

          {/* Multi-branch Performance */}
          {branches && branches.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Hiệu suất chi nhánh</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Chi nhánh</th>
                      <th className="text-right p-2">Doanh thu</th>
                      <th className="text-right p-2">Lịch hẹn</th>
                      <th className="text-right p-2">Đánh giá</th>
                      <th className="text-right p-2">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch: any) => (
                      <tr key={branch.branchId} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{branch.branchName}</td>
                        <td className="p-2 text-right">
                          {branch.revenue?.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-2 text-right">{branch.bookings}</td>
                        <td className="p-2 text-right">{branch.rating?.toFixed(1)}/5</td>
                        <td className="p-2 text-right">
                          <span className={`px-2 py-1 rounded ${
                            branch.score >= 80 ? "bg-green-100 text-green-800" :
                            branch.score >= 60 ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {branch.score?.toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Alerts */}
          {alerts && alerts.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Cảnh báo ({alerts.length})
              </h2>
              <div className="space-y-3">
                {alerts.slice(0, 10).map((alert: any, index: number) => (
                  <div
                    key={index}
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
