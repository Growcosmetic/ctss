"use client";

import React, { useMemo, useState } from "react";
import { Search, Phone, X, CheckCircle, Clock, User, Scissors, AlertCircle } from "lucide-react";
import { format, isToday, parse } from "date-fns";

interface BookingListPanelProps {
  bookingList: Array<{
    id: string;
    customerName: string;
    phone?: string;
    serviceName: string;
    date: string;
    start: string;
    end: string;
    status: string;
    notes?: string;
    stylistId?: string;
  }>;
  selectedDate: Date;
  onBookingClick?: (booking: any) => void;
  onCall?: (phone: string) => void;
  onCheckIn?: (id: string) => void;
  onCancel?: (id: string) => void;
  stylists?: Array<{ id: string; name: string }>;
}

export default function BookingListPanel({
  bookingList,
  selectedDate,
  onBookingClick,
  onCall,
  onCheckIn,
  onCancel,
  stylists = [],
}: BookingListPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter bookings for selected date
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isSelectedToday = isToday(selectedDate);

  const filteredBookings = useMemo(() => {
    let filtered = bookingList.filter((b) => b.date === selectedDateStr);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customerName.toLowerCase().includes(query) ||
          b.phone?.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query) ||
          b.serviceName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (b) => b.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    // Sort by time
    return filtered.sort((a, b) => {
      const [aHour, aMin] = a.start.split(":").map(Number);
      const [bHour, bMin] = b.start.split(":").map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });
  }, [bookingList, selectedDateStr, searchQuery, statusFilter]);

  // Tính toán booking sắp đến (< 30 phút)
  const getTimeUntilBooking = (booking: any) => {
    if (!booking.date || !booking.start) return null;
    const bookingDateTime = new Date(`${booking.date}T${booking.start}`);
    const now = new Date();
    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes;
  };

  // Calculate stats
  const stats = useMemo(() => {
    const todayBookings = bookingList.filter((b) => b.date === selectedDateStr);
    return {
      total: todayBookings.length,
      cancelled: todayBookings.filter(
        (b) => b.status?.toUpperCase() === "CANCELLED"
      ).length,
      inProgress: todayBookings.filter(
        (b) => b.status?.toUpperCase() === "IN_PROGRESS"
      ).length,
      completed: todayBookings.filter(
        (b) => b.status?.toUpperCase() === "COMPLETED"
      ).length,
    };
  }, [bookingList, selectedDateStr]);

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "IN_PROGRESS":
        return "bg-green-100 text-green-700 border-green-300";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PENDING":
        return "Chờ xác nhận";
      case "IN_PROGRESS":
        return "Đang làm";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleCall = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    if (onCall) {
      onCall(phone);
    } else {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleCheckIn = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onCheckIn) {
      onCheckIn(id);
    }
  };

  const handleCancel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onCancel) {
      onCancel(id);
    }
  };

  const dateLabel = isSelectedToday
    ? `Hôm nay (${format(selectedDate, "dd/MM/yyyy")})`
    : format(selectedDate, "EEEE, dd/MM/yyyy");

  return (
    <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 h-fit max-h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {dateLabel}
        </h3>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm khách hàng hoặc mã đặt lịch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] text-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] text-sm bg-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="IN_PROGRESS">Đang làm</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>

        {/* Stats Summary */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-1">
            Tổng {stats.total} lịch
            {stats.cancelled > 0 && ` / ${stats.cancelled} hủy`}
          </p>
          <div className="flex gap-2 flex-wrap">
            {stats.inProgress > 0 && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                Đang làm: {stats.inProgress}
              </span>
            )}
            {stats.completed > 0 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                Hoàn thành: {stats.completed}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Booking List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Không có lịch hẹn nào</p>
            {searchQuery && (
              <p className="text-xs mt-2">Thử tìm kiếm khác</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const stylist = stylists.find((s) => s.id === booking.stylistId);
              const canCheckIn =
                booking.status?.toUpperCase() === "PENDING" ||
                booking.status?.toUpperCase() === "CONFIRMED";
              const timeUntil = getTimeUntilBooking(booking);
              const isUpcoming = timeUntil !== null && timeUntil > 0 && timeUntil <= 30;

              return (
                <div
                  key={booking.id}
                  onClick={() => onBookingClick?.(booking)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-[#A4E3E3] hover:shadow-sm transition-all cursor-pointer bg-white relative"
                >
                  {/* Badge "Sắp đến" */}
                  {isUpcoming && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-md">
                      <AlertCircle className="w-3 h-3" />
                      <span>Sắp đến</span>
                    </div>
                  )}
                  
                  {/* Header: Time + Status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-bold text-gray-900">
                        {booking.start}
                      </span>
                      {booking.end && (
                        <span className="text-xs text-gray-500">
                          ~ {booking.end}
                        </span>
                      )}
                      {isUpcoming && timeUntil !== null && (
                        <span className="text-xs text-red-600 font-medium">
                          ({timeUntil} phút)
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  {/* Customer Name */}
                  <p className="text-base font-bold text-gray-900 mb-1">
                    {booking.customerName}
                  </p>

                  {/* Phone */}
                  {booking.phone && (
                    <div
                      onClick={(e) => handleCall(e, booking.phone!)}
                      className="flex items-center gap-1 text-blue-600 text-sm hover:underline cursor-pointer mb-1 w-fit"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="font-medium">{booking.phone}</span>
                    </div>
                  )}

                  {/* Service */}
                  <div className="flex items-center gap-1 mb-2">
                    <Scissors className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      {booking.serviceName}
                    </span>
                  </div>

                  {/* Stylist */}
                  {stylist && (
                    <div className="flex items-center gap-1 mb-2">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs text-purple-700 font-medium">
                        {stylist.name}
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {booking.notes && (
                    <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">
                      {booking.notes}
                    </p>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    {booking.phone && (
                      <button
                        onClick={(e) => handleCall(e, booking.phone!)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        Gọi điện
                      </button>
                    )}
                    {canCheckIn && onCheckIn && (
                      <button
                        onClick={(e) => handleCheckIn(e, booking.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Check-in
                      </button>
                    )}
                    {booking.status?.toUpperCase() !== "CANCELLED" &&
                      onCancel && (
                        <button
                          onClick={(e) => handleCancel(e, booking.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Hủy
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

