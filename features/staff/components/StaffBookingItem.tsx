"use client";

import React from "react";
import { StaffBooking } from "../types";
import { format } from "date-fns";
import { Clock, User, Scissors, CheckCircle, PlayCircle, AlertCircle } from "lucide-react";

interface StaffBookingItemProps {
  booking: StaffBooking;
  isSelected: boolean;
  onClick: () => void;
}

export default function StaffBookingItem({
  booking,
  isSelected,
  onClick,
}: StaffBookingItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "border-blue-300 bg-blue-50";
      case "IN_SERVICE":
        return "border-green-300 bg-green-50";
      case "COMPLETED":
        return "border-gray-300 bg-gray-50";
      case "NO_SHOW":
        return "border-red-300 bg-red-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "IN_SERVICE":
        return <PlayCircle className="w-4 h-4 text-green-600" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case "NO_SHOW":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "Sắp đến";
      case "IN_SERVICE":
        return "Đang làm";
      case "COMPLETED":
        return "Hoàn thành";
      case "NO_SHOW":
        return "Không đến";
      default:
        return status;
    }
  };

  const bookingTime = new Date(booking.bookingTime);
  const endTime = new Date(bookingTime.getTime() + booking.duration * 60 * 1000);

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : `${getStatusColor(booking.status)} hover:shadow-md`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Time */}
        <div className="flex-shrink-0 text-center">
          <div className="text-lg font-bold text-gray-900">
            {format(bookingTime, "HH:mm")}
          </div>
          <div className="text-xs text-gray-500">
            {format(endTime, "HH:mm")}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(booking.status)}
            <span className="text-xs font-medium text-gray-600">
              {getStatusLabel(booking.status)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            {booking.customerName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Scissors className="w-3 h-3" />
            <span className="truncate">{booking.serviceName}</span>
          </div>
          {booking.customerPhone && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span>{booking.customerPhone}</span>
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-medium text-gray-700">
            {booking.duration} phút
          </div>
        </div>
      </div>
    </div>
  );
}

