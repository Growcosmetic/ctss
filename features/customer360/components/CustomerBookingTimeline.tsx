// ============================================
// Customer360 Booking Timeline
// ============================================

"use client";

import React from "react";
import { Calendar, Scissors, User, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import type { CustomerBookingHistory } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CustomerBookingTimelineProps {
  bookings: CustomerBookingHistory[];
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  COMPLETED: {
    label: "Hoàn thành",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: CheckCircle,
  },
  PENDING: {
    label: "Chờ xử lý",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    icon: Clock,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
  NO_SHOW: {
    label: "Không đến",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    icon: XCircle,
  },
};

export function CustomerBookingTimeline({
  bookings,
}: CustomerBookingTimelineProps) {
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "EEEE, dd MMMM yyyy", { locale: vi });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  const formatTime = (dateString: string): string => {
    try {
      return format(new Date(dateString), "HH:mm", { locale: vi });
    } catch {
      return "";
    }
  };

  const getStatusConfig = (status: string) => {
    const upperStatus = status.toUpperCase();
    return (
      statusConfig[upperStatus] || {
        label: status,
        color: "text-gray-600",
        bg: "bg-gray-50 border-gray-200",
        icon: Clock,
      }
    );
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Lịch sử dịch vụ
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Khách chưa có lịch sử dịch vụ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Lịch sử dịch vụ
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {bookings.length} {bookings.length === 1 ? "lịch hẹn" : "lịch hẹn"}
        </span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200"></div>

        <div className="space-y-6">
          {bookings.map((booking, index) => {
            const statusInfo = getStatusConfig(booking.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={booking.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  </div>
                </div>

                {/* Content card */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  {/* Date and Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {formatDate(booking.date)}
                        </div>
                        {formatTime(booking.date) && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {formatTime(booking.date)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.bg} ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Service Name */}
                  {booking.serviceName && (
                    <div className="flex items-center gap-2 mb-2">
                      <Scissors className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900">
                        {booking.serviceName}
                      </span>
                    </div>
                  )}

                  {/* Stylist and Branch */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                    {booking.stylistName && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{booking.stylistName}</span>
                      </div>
                    )}
                    {booking.branchName && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{booking.branchName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

