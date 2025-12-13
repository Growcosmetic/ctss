"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import StatCard from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Calendar, TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, BarChart3, Loader2 } from "lucide-react";
import AISummaryCard from "@/components/dashboard/AISummaryCard";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface InsightsData {
  period: {
    start: string;
    end: string;
    type: string;
  };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    change: number;
    byStatus: Array<{ status: string; count: number }>;
    byStaff: Array<{ staffId: string; staffName: string; bookings: number }>;
  };
  revenue: {
    total: number;
    change: number;
    transactions: number;
    averageOrderValue: number;
    byDay: Array<{ date: string; revenue: number; transactions: number }>;
  };
  customers: {
    total: number;
    new: number;
    change: number;
    bySource: Array<{ source: string; count: number }>;
    topCustomers: Array<{ id: string; name: string; totalSpent: number; totalVisits: number }>;
  };
  staff: {
    total: number;
    active: number;
    performance: Array<{ id: string; name: string; role: string; totalBookings: number; completedBookings: number; completionRate: number }>;
  };
  meta: {
    generatedAt: string;
    duration: number;
    mock?: boolean;
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function InsightsPage() {
  const router = useRouter();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  useEffect(() => {
    fetchInsights();
  }, [period]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/insights/overview?period=${period}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to load insights");
      }
    } catch (err: any) {
      console.error("Failed to fetch insights:", err);
      setError(err.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <RoleGuard roles={[CTSSRole.OWNER, CTSSRole.ADMIN]}>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard roles={[CTSSRole.OWNER, CTSSRole.ADMIN]}>
        <MainLayout>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu</p>
            <p className="text-red-600 mt-2">{error}</p>
            <Button variant="primary" onClick={fetchInsights} className="mt-4">
              Thử lại
            </Button>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <RoleGuard roles={[CTSSRole.OWNER, CTSSRole.ADMIN]}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operation Insights</h1>
              <p className="text-gray-600 mt-1">
                {data.period.start} - {data.period.end}
                {data.meta.mock && <span className="ml-2 text-yellow-600">(Mock Data)</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={period === "day" ? "primary" : "outline"}
                size="sm"
                onClick={() => setPeriod("day")}
              >
                Ngày
              </Button>
              <Button
                variant={period === "week" ? "primary" : "outline"}
                size="sm"
                onClick={() => setPeriod("week")}
              >
                Tuần
              </Button>
              <Button
                variant={period === "month" ? "primary" : "outline"}
                size="sm"
                onClick={() => setPeriod("month")}
              >
                Tháng
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Tổng lịch hẹn"
              value={data.bookings.total}
              icon={Calendar}
              description={`${data.bookings.completed} hoàn thành`}
              footer={
                <div className="flex items-center gap-1 text-sm">
                  {data.bookings.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={data.bookings.change >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatPercent(data.bookings.change)}
                  </span>
                </div>
              }
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />

            <StatCard
              title="Doanh thu"
              value={formatCurrency(data.revenue.total)}
              icon={DollarSign}
              description={`${data.revenue.transactions} giao dịch`}
              footer={
                <div className="flex items-center gap-1 text-sm">
                  {data.revenue.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={data.revenue.change >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatPercent(data.revenue.change)}
                  </span>
                </div>
              }
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />

            <StatCard
              title="Khách hàng mới"
              value={data.customers.new}
              icon={Users}
              description={`Tổng: ${data.customers.total}`}
              footer={
                <div className="flex items-center gap-1 text-sm">
                  {data.customers.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={data.customers.change >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatPercent(data.customers.change)}
                  </span>
                </div>
              }
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />

            <StatCard
              title="Nhân viên"
              value={data.staff.active}
              icon={Users}
              description={`Tổng: ${data.staff.total}`}
              footer={`${data.staff.performance.length} người có hoạt động`}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>

          {/* Charts Row 1: Revenue & Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h2>
              {data.revenue.byDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.revenue.byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: "#374151" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Doanh thu"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Không có dữ liệu
                </div>
              )}
            </div>

            {/* Bookings by Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch hẹn theo trạng thái</h2>
              {data.bookings.byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.bookings.byStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.bookings.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>

          {/* Charts Row 2: Staff Performance & Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Performance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất nhân viên</h2>
              {data.staff.performance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.staff.performance.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalBookings" fill="#3b82f6" name="Tổng lịch hẹn" />
                    <Bar dataKey="completedBookings" fill="#10b981" name="Hoàn thành" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Không có dữ liệu
                </div>
              )}
            </div>

            {/* Customers by Source */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Khách hàng theo nguồn</h2>
              {data.customers.bySource.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.customers.bySource}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" name="Số lượng" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Khách hàng hàng đầu</h2>
              {data.customers.topCustomers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Tên</th>
                        <th className="text-right p-2">Chi tiêu</th>
                        <th className="text-right p-2">Lần đến</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.customers.topCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b">
                          <td className="p-2">{customer.name}</td>
                          <td className="text-right p-2">{formatCurrency(customer.totalSpent)}</td>
                          <td className="text-right p-2">{customer.totalVisits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
              )}
            </div>

            {/* Staff Performance Table */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết nhân viên</h2>
              {data.staff.performance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Tên</th>
                        <th className="text-right p-2">Lịch hẹn</th>
                        <th className="text-right p-2">Hoàn thành</th>
                        <th className="text-right p-2">Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.staff.performance.slice(0, 10).map((staff) => (
                        <tr key={staff.id} className="border-b">
                          <td className="p-2">{staff.name}</td>
                          <td className="text-right p-2">{staff.totalBookings}</td>
                          <td className="text-right p-2">{staff.completedBookings}</td>
                          <td className="text-right p-2">{staff.completionRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
              )}
            </div>
          </div>

          {/* AI Summary */}
          <AISummaryCard period={period} />

          {/* Meta Info */}
          {data.meta && (
            <div className="text-xs text-gray-500 text-center">
              Dữ liệu được tạo lúc {new Date(data.meta.generatedAt).toLocaleString("vi-VN")} 
              {data.meta.duration && ` • Thời gian xử lý: ${data.meta.duration}ms`}
            </div>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}

