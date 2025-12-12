"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Card } from "@/components/ui/Card";
import { Loader2, Users, Target, TrendingUp, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PersonalizationDashboardPage() {
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
      const res = await fetch(`/api/personalization/dashboard`);
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

  const { overview, personalizationStats, topSegments, recommendations } = data || {};

  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER]}>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personalization Dashboard</h1>
              <p className="text-gray-600 mt-1">Cá nhân hóa trải nghiệm khách hàng</p>
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
                    <p className="text-sm text-gray-600">Tổng cá nhân hóa</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.totalPersonalizations}
                    </p>
                  </div>
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tỷ lệ engagement</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.engagementRate?.toFixed(1)}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conversion rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.conversionRate?.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active segments</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overview.activeSegments}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </Card>
            </div>
          )}

          {personalizationStats && personalizationStats.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Thống kê Cá nhân hóa</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={personalizationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
