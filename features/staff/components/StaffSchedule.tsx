"use client";

import React from "react";
import { StaffBooking } from "../types";
import StaffBookingItem from "./StaffBookingItem";
import { Loader2, Calendar } from "lucide-react";

interface StaffScheduleProps {
  bookings: StaffBooking[];
  selectedBookingId: string | null;
  onBookingClick: (booking: StaffBooking) => void;
  loading?: boolean;
}

export default function StaffSchedule({
  bookings,
  selectedBookingId,
  onBookingClick,
  loading,
}: StaffScheduleProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Không có lịch hẹn nào hôm nay</p>
        <p className="text-sm text-gray-500 mt-1">Bạn có thể nghỉ ngơi hoặc chuẩn bị cho ngày mai</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <StaffBookingItem
          key={booking.id}
          booking={booking}
          isSelected={selectedBookingId === booking.id}
          onClick={() => onBookingClick(booking)}
        />
      ))}
    </div>
  );
}

