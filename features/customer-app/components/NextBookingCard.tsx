"use client";

import React from "react";
import { Calendar, Clock, Scissors, User } from "lucide-react";
import { format } from "date-fns";
import { CustomerBooking } from "../types";

interface NextBookingCardProps {
  booking: CustomerBooking | null;
  loading?: boolean;
}

export default function NextBookingCard({
  booking,
  loading,
}: NextBookingCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Chưa có lịch hẹn sắp tới</p>
          <p className="text-sm text-gray-500 mt-1">
            Đặt lịch ngay để được phục vụ tốt nhất
          </p>
        </div>
      </div>
    );
  }

  const bookingDateTime = new Date(booking.bookingTime);
  const isToday = format(bookingDateTime, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pink-600" />
          Lịch hẹn tiếp theo
        </h3>
        {isToday && (
          <span className="px-3 py-1 bg-pink-600 text-white text-xs font-medium rounded-full">
            Hôm nay
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="font-medium">
            {format(bookingDateTime, "EEEE, dd/MM/yyyy")}
          </span>
          <span className="text-gray-500">
            lúc {format(bookingDateTime, "HH:mm")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Scissors className="w-4 h-4 text-gray-500" />
          <span>
            {booking.services.map((s) => s.name).join(", ")}
          </span>
        </div>

        {booking.stylist && (
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-gray-500" />
            <span>Stylist: {booking.stylist.name}</span>
          </div>
        )}

        <div className="pt-3 border-t border-pink-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Thời lượng:</span>
            <span className="font-medium">{booking.duration} phút</span>
          </div>
        </div>
      </div>
    </div>
  );
}

