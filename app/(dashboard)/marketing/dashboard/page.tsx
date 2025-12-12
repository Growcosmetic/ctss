"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Card } from "@/components/ui/Card";
import { Loader2, TrendingUp, Users, DollarSign, Target, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MarketingDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/marketing/dashboard?${params.toString()}`);
      const result = await res.json();
      
      if (result.success) {
        setData(result.dashboard);
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

  const { kpis, channels, activeCampaigns, topCampaigns, segments, trends } = data || {};

  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER]}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketing Dashboard</h1>
              <p className="text-gray-600 mt-1">Tổng quan hiệu suất marketing</p>
            </div>
            <div className="flex gap-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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

          {/* KPI Cards */}
          {kpis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng Leads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpis.totalLeads?.toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tỷ lệ chuyển đổi</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpis.conversionRate?.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {kpis.totalCustomers} khách hàng
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chi phí/Lead</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpis.costPerLead?.toLocaleString("vi-VN")} đ
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Tổng chi: {kpis.totalAdSpend?.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ROI</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      kpis.roi >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {kpis.roi?.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Doanh thu: {kpis.totalRevenue?.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
            </div>
          )}

          {/* Channel Performance */}
          {channels && channels.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Hiệu suất theo Kênh</h2>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={channels}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channelName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
                    <Bar dataKey="adSpend" fill="#ef4444" name="Chi phí quảng cáo" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Top Campaigns */}
          {topCampaigns && topCampaigns.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Chiến dịch Hiệu quả Nhất</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Chiến dịch</th>
                      <th className="text-left p-2">Kênh</th>
                      <th className="text-right p-2">ROI</th>
                      <th className="text-right p-2">Doanh thu</th>
                      <th className="text-right p-2">Chi phí</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCampaigns.map((campaign: any) => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{campaign.name}</td>
                        <td className="p-2">{campaign.channel?.name || "N/A"}</td>
                        <td className="p-2 text-right">
                          <span className={`px-2 py-1 rounded ${
                            campaign.roi >= 100 ? "bg-green-100 text-green-800" :
                            campaign.roi >= 50 ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {campaign.roi?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          {campaign.revenue?.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-2 text-right">
                          {campaign.budget?.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
