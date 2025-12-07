"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getBranch, getBranchKPIs } from "@/features/branches/services/branchApi";
import { Branch, BranchKPIs } from "@/features/branches/types";
import { Loader2, DollarSign, Calendar, Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BranchDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { authenticated, loading: authLoading, hasRole } = useAuth();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [kpis, setKPIs] = useState<BranchKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push("/login");
      return;
    }

    if (authenticated && branchId) {
      loadData();
    }
  }, [authenticated, authLoading, branchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [branchData, kpisData] = await Promise.all([
        getBranch(branchId),
        getBranchKPIs(branchId, "today"),
      ]);
      setBranch(branchData);
      setKPIs(kpisData);
    } catch (error) {
      console.error("Error loading branch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Branch not found</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{branch.name}</h1>
              {branch.address && (
                <p className="text-sm text-gray-600 mt-1">{branch.address}</p>
              )}
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today Revenue */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Doanh thu hôm nay</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(kpis.todayRevenue)}
              </div>
            </div>

            {/* Today Bookings */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Lịch hẹn hôm nay</span>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {kpis.todayBookings}
              </div>
            </div>

            {/* Staff Working */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Nhân viên làm việc</span>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {kpis.todayStaffWorking}
              </div>
            </div>

            {/* Week Revenue */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Doanh thu tuần</span>
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(kpis.weekRevenue)}
              </div>
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dịch vụ phổ biến
            </h2>
            {kpis.topServices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {kpis.topServices.map((service, index) => (
                  <div
                    key={service.serviceId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {service.serviceName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.count} lần đặt
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(service.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

