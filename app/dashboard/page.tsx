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
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Lỗi: {error}</p>
          </div>
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
          {/* Header */}
          <DashboardHeader onRefresh={refresh} refreshing={loading} />

          {/* Today's Stats */}
          {data?.stats && (
            <TodayStatsCard stats={data.stats} showRevenue={showRevenue} />
          )}

          {/* Quick Actions */}
          <QuickActionsBar
            onCreateBooking={handleCreateBooking}
            onAddWalkIn={handleAddWalkIn}
          />

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
