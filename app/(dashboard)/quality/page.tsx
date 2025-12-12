"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Card } from "@/components/ui/Card";
import { Loader2, CheckCircle, AlertTriangle, TrendingUp, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function QualityDashboardPage() {
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

      const res = await fetch(`/api/quality/dashboard?${params.toString()}`);
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

  const { overall, staffQuality, recentErrors, recentAudits } = data || {};

  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER]}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quality Dashboard</h1>
              <p className="text-gray-600 mt-1">Kiểm soát chất lượng dịch vụ</p>
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

          {/* Overview Cards */}
          {overall && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Điểm chất lượng TB</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overall.avgScore?.toFixed(1)}/100
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng dịch vụ</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overall.totalServices}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lỗi phát hiện</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overall.totalErrors}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tỷ lệ đạt chuẩn</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {overall.complianceRate?.toFixed(1)}%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
            </div>
          )}

          {/* Staff Quality */}
          {staffQuality && staffQuality.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Chất lượng theo Nhân viên</h2>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={staffQuality}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="staffName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="#3b82f6" name="Điểm TB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Recent Errors */}
          {recentErrors && recentErrors.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Lỗi Gần Đây
              </h2>
              <div className="space-y-3">
                {recentErrors.slice(0, 10).map((error: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{error.errorType}</p>
                        <p className="text-sm text-gray-600 mt-1">{error.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(error.capturedAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        error.severity === "HIGH"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}>
                        {error.severity}
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
