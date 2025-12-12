"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Card } from "@/components/ui/Card";
import { Loader2, Building2, Users, DollarSign, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PartnerHQPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/partner/hq/dashboard`);
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

  const { overview, partnerPerformance, topPartners } = data || {};

  return (
    <RoleGuard roles={[CTSSRole.ADMIN]}>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Partner HQ Dashboard</h1>
              <p className="text-gray-600 mt-1">Quản lý đối tác và franchise</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Làm mới
            </button>
          </div>

          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng đối tác</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.totalPartners}
                    </p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đối tác hoạt động</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.activePartners}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.totalRevenue?.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tăng trưởng</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.growthRate?.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </Card>
            </div>
          )}

          {topPartners && topPartners.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Top Đối tác</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Đối tác</th>
                      <th className="text-right p-2">Doanh thu</th>
                      <th className="text-right p-2">Chi nhánh</th>
                      <th className="text-right p-2">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPartners.map((partner: any) => (
                      <tr key={partner.partnerId} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{partner.partnerName}</td>
                        <td className="p-2 text-right">
                          {partner.revenue?.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-2 text-right">{partner.branchCount}</td>
                        <td className="p-2 text-right">
                          <span className={`px-2 py-1 rounded ${
                            partner.score >= 80 ? "bg-green-100 text-green-800" :
                            partner.score >= 60 ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {partner.score?.toFixed(0)}
                          </span>
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
