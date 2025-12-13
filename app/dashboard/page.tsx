"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import TodayStatsCard from "@/features/dashboard/components/TodayStatsCard";
import StaffPerformanceTable from "@/features/dashboard/components/StaffPerformanceTable";
import BookingTimeline from "@/features/dashboard/components/BookingTimeline";
import AlertsPanel from "@/features/dashboard/components/AlertsPanel";
import QuickActionsBar from "@/features/dashboard/components/QuickActionsBar";
import KPICards from "@/components/dashboard/KPICards";
import DashboardModuleGrid from "@/components/dashboard/DashboardModuleGrid";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, loading, error, refresh } = useDashboard();
  const [showCreateBooking, setShowCreateBooking] = useState(false);

  const handleCreateBooking = () => {
    router.push("/booking?action=create");
  };

  const handleAddWalkIn = () => {
    router.push("/booking?action=walkin");
  };

  if (loading && !data) {
    return (
      <RoleGuard
        roles={[
          CTSSRole.ADMIN,
          CTSSRole.MANAGER,
          CTSSRole.RECEPTIONIST,
          CTSSRole.STYLIST,
          CTSSRole.ASSISTANT,
        ]}
      >
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
      <RoleGuard
        roles={[
          CTSSRole.ADMIN,
          CTSSRole.MANAGER,
          CTSSRole.RECEPTIONIST,
          CTSSRole.STYLIST,
          CTSSRole.ASSISTANT,
        ]}
      >
        <MainLayout>
          <EmptyState
            icon={AlertCircle}
            title="Lỗi tải dữ liệu"
            description={error}
            action={{
              label: "Thử lại",
              onClick: refresh,
            }}
          />
        </MainLayout>
      </RoleGuard>
    );
  }

  const showRevenue = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "RECEPTIONIST";

  return (
    <RoleGuard
      roles={[
        CTSSRole.ADMIN,
        CTSSRole.MANAGER,
        CTSSRole.RECEPTIONIST,
        CTSSRole.STYLIST,
        CTSSRole.ASSISTANT,
      ]}
    >
      <MainLayout>
        <div className="space-y-6">
          {/* Page Title */}
          <h1 className="sr-only">Dashboard</h1>
          
          {/* Header */}
          <DashboardHeader onRefresh={refresh} refreshing={loading} />

          {/* KPI Cards - 4 cards ngang */}
          {data?.stats && (
            <KPICards
              stats={{
                bookingsToday: data.stats.totalBookings,
                bookingsThisMonth: data.stats.totalBookings, // Có thể tính từ API
                revenueToday: data.stats.totalRevenue,
                invoicesToday: data.stats.completedBookings, // Tạm dùng completed
                newCustomers: data.stats.newCustomers,
                returningCustomers: data.stats.returningCustomers,
                totalStaff: 10, // Sẽ lấy từ API
                activeStaff: 8, // Sẽ lấy từ API
              }}
            />
          )}

          {/* Quick Actions */}
          <QuickActionsBar
            onCreateBooking={handleCreateBooking}
            onAddWalkIn={handleAddWalkIn}
          />

          {/* Link to All Modules - Thay thế Module Grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Tất cả các Module</h2>
                <p className="text-gray-600 text-sm">
                  Khám phá tất cả các tính năng của hệ thống CTSS với tìm kiếm và bộ lọc
                </p>
              </div>
              <Button
                onClick={() => router.push("/modules")}
                variant="primary"
                aria-label="Xem tất cả modules"
              >
                Xem tất cả →
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Timeline */}
            <div className="lg:col-span-2">
              {data?.timeline && <BookingTimeline timeline={data.timeline} />}
            </div>

            {/* Right Column - Alerts */}
            <div>
              {data?.alerts && <AlertsPanel alerts={data.alerts} />}
            </div>
          </div>

          {/* Staff Performance (Admin/Manager only) */}
          {(user?.role === "ADMIN" || user?.role === "MANAGER") && data?.staffPerformance && (
            <StaffPerformanceTable performance={data.staffPerformance} />
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
