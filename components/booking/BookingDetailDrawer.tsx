"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Scissors,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Sparkles,
  RefreshCw,
  History,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { fakeStylists } from "@/lib/data/fakeStylists";
import { fakeBookings } from "@/lib/data/fakeBookings";
import { useCustomer360 } from "@/features/customer360/hooks/useCustomer360";
import { Customer360Layout } from "@/features/customer360/components/Customer360Layout";
import { getCustomer } from "@/features/crm/services/crmApi";

interface BookingDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    customerName: string;
    phone: string;
    serviceName: string;
    stylistId?: string;
    stylistName?: string;
    date: string;
    time: string;
    duration: number;
    status: "CONFIRMED" | "PENDING" | "CANCELLED" | "IN_PROGRESS" | "COMPLETED" | "confirmed" | "pending" | "cancelled";
    notes?: string;
  } | null;
  bookingList: Array<{
    id: string;
    customerName: string;
    phone?: string;
    stylistId: string;
    date: string;
    start: string;
    end: string;
    [key: string]: any;
  }>;
  setBookingList: (bookings: any[]) => void;
  onEdit: () => void;
  onCancel: () => void;
  onChangeStylist?: (newStylistId: string) => void;
  onViewHistory?: () => void;
}

// AI Suggestion logic
function getAISuggestions(
  booking: BookingDetailDrawerProps["booking"],
  bookingList: BookingDetailDrawerProps["bookingList"] = []
) {
  if (!booking) return [];

  const suggestions = [];

  // 1. Find stylists who have worked with this customer before
  const customerHistory = bookingList.filter(
    (b) => b.phone === booking.phone && b.id !== booking.id
  );
  const previousStylists = new Set(
    customerHistory.map((b) => b.stylistId)
  );

  if (previousStylists.size > 0) {
    const stylistNames = Array.from(previousStylists)
      .map((id) => fakeStylists.find((s) => s.id === id)?.name)
      .filter(Boolean);
    suggestions.push({
      type: "history",
      message: `Khách hàng này đã từng làm với: ${stylistNames.join(", ")}. Có thể đề xuất lại các stylist này.`,
      priority: "high",
    });
  }

  // 2. Find available stylists at the same time
  const [bookingHour, bookingMinute] = booking.time.split(":").map(Number);
  const bookingStart = bookingHour * 60 + bookingMinute;
  const bookingEnd = bookingStart + booking.duration;

  const availableStylists = fakeStylists.filter((stylist) => {
    // Check if stylist has any booking at the same time
    const hasConflict = bookingList.some((b) => {
      if (b.stylistId !== stylist.id) return false;
      if (b.date !== booking.date) return false;
      if (b.id === booking.id) return false;

      const [bHour, bMinute] = b.start.split(":").map(Number);
      const bStart = bHour * 60 + bMinute;
      const [bEndHour, bEndMinute] = b.end.split(":").map(Number);
      const bEnd = bEndHour * 60 + bEndMinute;

      return (
        (bookingStart >= bStart && bookingStart < bEnd) ||
        (bookingEnd > bStart && bookingEnd <= bEnd) ||
        (bookingStart <= bStart && bookingEnd >= bEnd)
      );
    });

    return !hasConflict;
  });

  if (availableStylists.length > 0) {
    suggestions.push({
      type: "available",
      message: `Các stylist rảnh vào thời điểm này: ${availableStylists.map((s) => s.name).join(", ")}.`,
      priority: "medium",
    });
  }

  // 3. Suggest high-rated stylists (mock data - in real app would come from database)
  const highRatedStylists = fakeStylists.slice(0, 2); // Mock: first 2 are high-rated
  suggestions.push({
    type: "rating",
    message: `Stylist có rating cao: ${highRatedStylists.map((s) => s.name).join(", ")}. Có thể đề xuất cho khách hàng VIP.`,
    priority: "low",
  });

  return suggestions;
}

export default function BookingDetailDrawer({
  isOpen,
  onClose,
  booking,
  bookingList,
  setBookingList,
  onEdit,
  onCancel,
  onChangeStylist,
  onViewHistory,
}: BookingDetailDrawerProps) {
  const [open360, setOpen360] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const { data: customer360Data, loading: customer360Loading } = useCustomer360(
    customerId || ""
  );

  // Fetch customerId from phone when booking changes
  useEffect(() => {
    if (booking?.phone && !customerId) {
      getCustomer(booking.phone)
        .then((customer) => {
          if (customer?.id) {
            setCustomerId(customer.id);
          }
        })
        .catch(() => {
          // Customer not found, ignore
        });
    }
  }, [booking?.phone, customerId]);

  const aiSuggestions = useMemo(
    () => getAISuggestions(booking, bookingList),
    [booking, bookingList]
  );

  if (!isOpen || !booking) return null;

  const getStatusColor = () => {
    const status = booking.status.toUpperCase();
    switch (status) {
      case "CONFIRMED":
      case "IN_PROGRESS":
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = () => {
    const status = booking.status.toUpperCase();
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PENDING":
        return "Chờ xác nhận";
      case "CANCELLED":
        return "Đã hủy";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return booking.status;
    }
  };

  const isCancelledOrCompleted =
    booking.status.toUpperCase() === "CANCELLED" ||
    booking.status.toUpperCase() === "COMPLETED";

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full bg-white transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: "420px",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Chi tiết lịch hẹn</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
              >
                <User className="w-5 h-5" style={{ color: "#A4E3E3" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-900">{booking.customerName}</p>
                  {customerId && (
                    <button
                      onClick={() => setOpen360(true)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Xem hồ sơ 360°
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
              >
                <Phone className="w-5 h-5" style={{ color: "#A4E3E3" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                <p className="text-lg font-semibold text-gray-900">{booking.phone}</p>
              </div>
            </div>
          </div>

          {/* Service & Stylist Info */}
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
              >
                <Scissors className="w-5 h-5" style={{ color: "#A4E3E3" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Dịch vụ</p>
                <p className="text-lg font-semibold text-gray-900">{booking.serviceName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
              >
                <User className="w-5 h-5" style={{ color: "#A4E3E3" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Stylist</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.stylistName || "Chưa chọn"}
                </p>
              </div>
            </div>
          </div>

          {/* Time Info */}
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
              >
                <Calendar className="w-5 h-5" style={{ color: "#A4E3E3" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Ngày</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(booking.date), "dd/MM/yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
              >
                <Clock className="w-5 h-5" style={{ color: "#A4E3E3" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Thời gian</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.time} ({booking.duration} phút)
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-2">Ghi chú</p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900 text-sm">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div
              className="border-t border-gray-200 pt-4 p-4 rounded-lg"
              style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" style={{ color: "#A4E3E3" }} />
                <h3 className="font-semibold text-gray-900">AI Gợi ý</h3>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <p className="text-sm text-gray-700">{suggestion.message}</p>
                    {suggestion.priority === "high" && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        Quan trọng
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 space-y-3">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-3">
            {!isCancelledOrCompleted && (
              <>
                <button
                  onClick={onEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Sửa lịch
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#ef4444" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ef4444";
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Hủy lịch
                </button>
              </>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            {!isCancelledOrCompleted && onChangeStylist && (
              <button
                onClick={() => {
                  // Find available stylist
                  const availableStylist = fakeStylists.find(
                    (s) => s.id !== booking.stylistId
                  );
                  if (availableStylist) {
                    onChangeStylist(availableStylist.id);
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Đổi stylist
              </button>
            )}
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4" />
                Lịch sử
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer360 Drawer */}
      {open360 && customerId && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-[60]" onClick={() => setOpen360(false)}>
          <div
            className="bg-white w-full max-w-6xl h-full overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {booking.customerName} - 360° View
              </h2>
              <button
                onClick={() => setOpen360(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {customer360Loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Đang tải dữ liệu 360°...</div>
                </div>
              ) : customer360Data ? (
                <Customer360Layout data={customer360Data} />
              ) : (
                <div className="text-gray-500 text-center py-12">Không có dữ liệu</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
