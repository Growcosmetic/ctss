"use client";

import React from "react";
import { Clock, User } from "lucide-react";

export default function BookingEvent({ booking, onClick }: any) {
  const getStatusColor = () => {
    const status = booking.status?.toUpperCase();
    switch (status) {
      case "CONFIRMED":
      case "IN_PROGRESS":
      case "COMPLETED":
        return {
          bg: "rgba(34, 197, 94, 0.2)",
          border: "rgba(34, 197, 94, 0.6)",
          text: "text-green-700",
        };
      case "PENDING":
        return {
          bg: "rgba(234, 179, 8, 0.2)",
          border: "rgba(234, 179, 8, 0.6)",
          text: "text-yellow-700",
        };
      case "CANCELLED":
        return {
          bg: "rgba(239, 68, 68, 0.2)",
          border: "rgba(239, 68, 68, 0.6)",
          text: "text-red-700",
        };
      default:
        return {
          bg: "rgba(164, 227, 227, 0.2)",
          border: "rgba(164, 227, 227, 0.6)",
          text: "text-gray-700",
        };
    }
  };

  const statusColors = getStatusColor();
  const heightInPx = (booking.duration / 30) * 60;

  return (
    <div
      onClick={onClick}
      className="absolute left-1 right-1 p-2 cursor-pointer border shadow-sm"
      style={{
        backgroundColor: statusColors.bg,
        borderColor: statusColors.border,
        borderRadius: "8px",
        height: `${heightInPx}px`,
        minHeight: "60px",
      }}
    >
      <div className="flex items-start gap-2">
        <User className="w-3 h-3" style={{ color: statusColors.border }} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold truncate ${statusColors.text}`}>
            {booking.customerName}
          </p>
          <p className="text-xs text-gray-600 truncate mt-0.5">
            {booking.serviceName}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">{booking.start}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
