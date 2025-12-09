"use client";

import React, { useState, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import AiInsightsPanel from "@/components/dashboard/AiInsightsPanel";
import { useUIStore } from "@/store/useUIStore";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingCalendar from "@/components/booking/BookingCalendar";
import BookingListPanel from "@/components/booking/BookingListPanel";
import StaffFilterPanel from "@/components/booking/StaffFilterPanel";
import CreateBookingModal, { BookingFormData } from "@/components/booking/CreateBookingModal";
import BookingDetailDrawer from "@/components/booking/BookingDetailDrawer";
import { fakeStylists } from "@/lib/data/fakeStylists";
import { fakeServices } from "@/lib/data/fakeServices";
import { fakeBookings, getDuration } from "@/lib/data/fakeBookings";
import { format, isToday, parse } from "date-fns";

export default function BookingPage() {
  const { sidebarOpen } = useUIStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStylists, setSelectedStylists] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"staff" | "time">("time");
  
  // Global state bookingList - không bị reset khi drawer mở/đóng
  const [bookingList, setBookingList] = useState(fakeBookings);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayBookings = bookingList.filter((b) => b.date === todayStr);
    
    return {
      todayTotal: todayBookings.length,
      todayPending: todayBookings.filter((b) => b.status?.toUpperCase() === "PENDING").length,
      todayInProgress: todayBookings.filter((b) => b.status?.toUpperCase() === "IN_PROGRESS").length,
      todayCompleted: todayBookings.filter((b) => b.status?.toUpperCase() === "COMPLETED").length,
    };
  }, [bookingList]);

  const handleCreateBooking = () => {
    setIsCreateModalOpen(true);
  };

  const handleSubmitBooking = (data: BookingFormData) => {
    const service = fakeServices.find((s) => s.id === data.serviceId);
    const stylist = fakeStylists.find((s) => s.id === data.stylistId);

    // Calculate end time
    const [startHour, startMinute] = data.time.split(":").map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = startTotalMinutes + (service?.duration || 30);
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

    const newBooking = {
      id: `booking-${Date.now()}`,
      customerName: data.customerName,
      serviceName: service?.name || "",
      stylistId: data.stylistId,
      date: data.date,
      start: data.time,
      end: endTime,
      status: "pending" as const,
      phone: data.phone,
      notes: data.notes,
    };

    setBookingList([...bookingList, newBooking]);
  };

  const handleBookingClick = (booking: any) => {
    // Tìm booking từ state bookingList
    const originalBooking = bookingList.find((b) => b.id === booking.id);
    if (originalBooking) {
      const stylist = fakeStylists.find((s) => s.id === booking.stylistId);
      setSelectedBooking({
        ...booking,
        phone: originalBooking.phone,
        stylistName: stylist?.name || "",
        notes: originalBooking.notes,
      });
      setIsDetailDrawerOpen(true);
    }
  };

  const handleEditBooking = () => {
    // TODO: Implement edit functionality
    console.log("Edit booking:", selectedBooking);
    setIsDetailDrawerOpen(false);
  };

  const handleCancelBookingFromDrawer = () => {
    if (selectedBooking) {
      setBookingList(
        bookingList.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: "cancelled" as const } : b
        )
      );
      setIsDetailDrawerOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleChangeStylist = (newStylistId: string) => {
    if (selectedBooking) {
      const stylist = fakeStylists.find((s) => s.id === newStylistId);
      setBookingList(
        bookingList.map((b) =>
          b.id === selectedBooking.id ? { ...b, stylistId: newStylistId } : b
        )
      );
      setSelectedBooking({
        ...selectedBooking,
        stylistId: newStylistId,
        stylistName: stylist?.name || "",
      });
    }
  };

  const handleViewHistory = () => {
    if (selectedBooking) {
      // TODO: Navigate to customer history page or open modal
      console.log("View history for customer:", selectedBooking.customerName);
      alert(`Xem lịch sử khách hàng: ${selectedBooking.customerName}`);
    }
  };

  const handleCheckIn = (bookingId: string) => {
    // Update booking status to IN_PROGRESS
    setBookingList(
      bookingList.map((b) =>
        b.id === bookingId ? { ...b, status: "IN_PROGRESS" as const } : b
      )
    );
    // TODO: Call API to update booking status
    // await fetch(`/api/bookings/${bookingId}`, { method: 'PATCH', body: JSON.stringify({ status: 'IN_PROGRESS' }) });
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookingList(
      bookingList.map((b) =>
        b.id === bookingId ? { ...b, status: "CANCELLED" as const } : b
      )
    );
  };

  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.RECEPTIONIST, CTSSRole.STYLIST, CTSSRole.ASSISTANT]}>
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <Sidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-[240px]' : 'lg:ml-0'}`}>
          <Header />
          <main className="flex-1 p-6 bg-[#FAFAFA]">
          <BookingHeader
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedStylists={selectedStylists}
            onStylistsChange={setSelectedStylists}
            selectedService={selectedService}
            onServiceChange={setSelectedService}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onCreateBooking={handleCreateBooking}
            stylists={fakeStylists}
            services={fakeServices}
            bookingList={bookingList}
            stats={todayStats}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <div className="flex gap-4">
            {/* Staff Filter Panel - Left Side */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <StaffFilterPanel
                  stylists={fakeStylists}
                  selectedStylists={selectedStylists}
                  onStylistsChange={setSelectedStylists}
                  bookingList={bookingList}
                  selectedDate={selectedDate}
                />
              </div>
            </div>

            {/* Calendar - Main Content */}
            <div className="flex-1">
              <BookingCalendar
                bookingList={bookingList}
                setBookingList={setBookingList}
                stylists={fakeStylists}
                selectedDate={selectedDate}
                onBookingClick={handleBookingClick}
                selectedStylists={selectedStylists}
                selectedService={selectedService}
                selectedStatus={selectedStatus}
                onCheckIn={handleCheckIn}
                onCall={handleCall}
                viewMode={viewMode}
              />
            </div>

            {/* Booking List Panel - Right Side */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <BookingListPanel
                  bookingList={bookingList}
                  selectedDate={selectedDate}
                  onBookingClick={handleBookingClick}
                  onCall={handleCall}
                  onCheckIn={handleCheckIn}
                  onCancel={handleCancelBooking}
                  stylists={fakeStylists}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* AI Insights Panel - Có thể ẩn/hiện (ẩn đi để nhường chỗ cho Booking List Panel) */}
      {/* <div className={`hidden lg:block p-6 transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
        <div className="sticky top-24">
          <AiInsightsPanel />
        </div>
      </div> */}

      {/* Create Booking Modal */}
      <CreateBookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSubmitBooking}
        stylists={fakeStylists}
        services={fakeServices}
        selectedDate={selectedDate}
      />

      {/* Booking Detail Drawer */}
      <BookingDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        bookingList={bookingList}
        setBookingList={setBookingList}
        onEdit={handleEditBooking}
        onCancel={handleCancelBookingFromDrawer}
        onChangeStylist={handleChangeStylist}
        onViewHistory={handleViewHistory}
      />
      </div>
    </RoleGuard>
  );
}
