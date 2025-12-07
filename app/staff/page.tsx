"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useStaff } from "@/features/staff/hooks/useStaff";
import StaffHeader from "@/features/staff/components/StaffHeader";
import StaffSchedule from "@/features/staff/components/StaffSchedule";
import CustomerQuickPanel from "@/features/staff/components/CustomerQuickPanel";
import ServiceChecklist from "@/features/staff/components/ServiceChecklist";
import StaffNotifications from "@/features/staff/components/StaffNotifications";
import QuickActions from "@/features/staff/components/QuickActions";
import { Loader2 } from "lucide-react";

export default function StaffPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Redirect non-staff users to dashboard
  useEffect(() => {
    if (user && user.role !== "STYLIST" && user.role !== "ASSISTANT") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const {
    bookings,
    selectedBooking,
    setSelectedBooking,
    customerInfo,
    checklist,
    loading,
    error,
    loadTodayBookings,
    loadCustomerQuickInfo,
    loadChecklist,
    saveChecklist,
    startService,
    completeService,
  } = useStaff();

  const [savingChecklist, setSavingChecklist] = useState(false);

  // Load customer info when booking is selected
  React.useEffect(() => {
    if (selectedBooking) {
      loadCustomerQuickInfo(selectedBooking.customerId);
      loadChecklist(selectedBooking.id);
    }
  }, [selectedBooking, loadCustomerQuickInfo, loadChecklist]);

  const handleSaveChecklist = async (checklistData: any) => {
    try {
      setSavingChecklist(true);
      await saveChecklist(checklistData);
    } catch (error) {
      console.error("Error saving checklist:", error);
    } finally {
      setSavingChecklist(false);
    }
  };

  const handleStartService = async () => {
    if (!selectedBooking) return;
    try {
      await startService(selectedBooking.id);
    } catch (error) {
      console.error("Error starting service:", error);
    }
  };

  const handleCompleteService = async () => {
    if (!selectedBooking) return;
    try {
      await completeService(selectedBooking.id);
    } catch (error) {
      console.error("Error completing service:", error);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <RoleGuard roles={[CTSSRole.STYLIST, CTSSRole.ASSISTANT]}>
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
      <RoleGuard roles={[CTSSRole.STYLIST, CTSSRole.ASSISTANT]}>
        <MainLayout>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Lỗi: {error}</p>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard roles={[CTSSRole.STYLIST, CTSSRole.ASSISTANT]}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <StaffHeader onRefresh={loadTodayBookings} refreshing={loading} />

          {/* Mobile Layout */}
          <div className="block md:hidden space-y-4">
            {/* Notifications */}
            <StaffNotifications />

            {/* Schedule */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Lịch hẹn hôm nay
              </h2>
              <StaffSchedule
                bookings={bookings}
                selectedBookingId={selectedBooking?.id || null}
                onBookingClick={setSelectedBooking}
                loading={loading}
              />
            </div>

            {/* Selected Booking Details */}
            {selectedBooking && (
              <div className="space-y-4">
                <QuickActions
                  booking={selectedBooking}
                  onStartService={handleStartService}
                  onCompleteService={handleCompleteService}
                />
                <CustomerQuickPanel
                  customerInfo={customerInfo}
                  loading={!customerInfo && selectedBooking !== null}
                />
                <ServiceChecklist
                  bookingId={selectedBooking.id}
                  serviceName={selectedBooking.serviceName}
                  serviceId={selectedBooking.serviceId}
                  checklist={checklist}
                  onSave={handleSaveChecklist}
                  loading={savingChecklist}
                />
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {/* Left Column - Schedule & Notifications */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Lịch hẹn hôm nay
                </h2>
                <StaffSchedule
                  bookings={bookings}
                  selectedBookingId={selectedBooking?.id || null}
                  onBookingClick={setSelectedBooking}
                  loading={loading}
                />
              </div>
              <StaffNotifications />
            </div>

            {/* Middle Column - Customer Info & Checklist */}
            <div className="space-y-6">
              {selectedBooking ? (
                <>
                  <CustomerQuickPanel
                    customerInfo={customerInfo}
                    loading={!customerInfo}
                  />
                  <ServiceChecklist
                    bookingId={selectedBooking.id}
                    serviceName={selectedBooking.serviceName}
                    serviceId={selectedBooking.serviceId}
                    checklist={checklist}
                    onSave={handleSaveChecklist}
                    loading={savingChecklist}
                  />
                </>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">
                    Chọn lịch hẹn để xem chi tiết
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Quick Actions */}
            <div>
              <QuickActions
                booking={selectedBooking}
                onStartService={handleStartService}
                onCompleteService={handleCompleteService}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
