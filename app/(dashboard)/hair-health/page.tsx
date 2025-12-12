"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Card } from "@/components/ui/Card";
import { Loader2, Heart, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HairHealthDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (customerId) {
      loadData();
    }
  }, [customerId]);

  const loadData = async () => {
    if (!customerId) {
      setError("Vui lòng nhập Customer ID");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hair-health/dashboard?customerId=${customerId}`);
      const result = await res.json();
      
      if (result.success || result.data) {
        setData(result.data || result);
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
      <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.STYLIST]}>
        <MainLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hair Health Dashboard</h1>
                <p className="text-gray-600 mt-1">Phân tích sức khỏe tóc</p>
              </div>
            </div>
            <Card className="p-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Customer ID</label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="Nhập Customer ID"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tải dữ liệu
                </button>
              </div>
            </Card>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  if (error && !customerId) {
    return (
      <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.STYLIST]}>
        <MainLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hair Health Dashboard</h1>
                <p className="text-gray-600 mt-1">Phân tích sức khỏe tóc</p>
              </div>
            </div>
            <Card className="p-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Customer ID</label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="Nhập Customer ID"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tải dữ liệu
                </button>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </Card>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  const { latestScan, latestDamage, latestPorosity, latestRisk, latestScalp, treatmentPlan } = data || {};

  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.STYLIST]}>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hair Health Dashboard</h1>
              <p className="text-gray-600 mt-1">Phân tích sức khỏe tóc</p>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Customer ID"
                className="px-4 py-2 border rounded-lg"
              />
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tải dữ liệu
              </button>
            </div>
          </div>

          {latestScan && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lần scan gần nhất</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {latestScan.overallScore?.toFixed(1)}/100
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
              </Card>

              {latestDamage && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Mức độ hư tổn</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {latestDamage.damageLevel}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                </Card>
              )}

              {latestPorosity && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Độ xốp</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {latestPorosity.porosityLevel}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </Card>
              )}

              {latestScalp && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tình trạng da đầu</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {latestScalp.condition}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </Card>
              )}
            </div>
          )}

          {treatmentPlan && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Kế hoạch Điều trị</h2>
              <div className="space-y-3">
                <p className="text-gray-700">{treatmentPlan.recommendations || "Chưa có kế hoạch"}</p>
              </div>
            </Card>
          )}

          {!data && (
            <Card className="p-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Customer ID</label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="Nhập Customer ID"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tải dữ liệu
                </button>
              </div>
            </Card>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
