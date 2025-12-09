"use client";

import React from "react";

interface BookingEventProps {
  booking: any;
  onClick?: () => void;
  onCheckIn?: (id: string) => void;
  onCall?: (phone: string) => void;
  stylists?: Array<{ id: string; name: string }>;
}

export default function BookingEvent({ 
  booking, 
  onClick, 
  onCheckIn,
  onCall,
  stylists = []
}: BookingEventProps) {
  const getStatusColor = () => {
    const status = booking.status?.toUpperCase();
    switch (status) {
      case "CONFIRMED":
        return {
          bg: "rgba(59, 130, 246, 0.15)", // Blue
          border: "rgba(59, 130, 246, 0.6)",
          text: "text-blue-700",
          borderLeft: "border-l-blue-500",
        };
      case "IN_PROGRESS":
        return {
          bg: "rgba(34, 197, 94, 0.15)", // Green
          border: "rgba(34, 197, 94, 0.6)",
          text: "text-green-700",
          borderLeft: "border-l-green-500",
        };
      case "COMPLETED":
        return {
          bg: "rgba(107, 114, 128, 0.15)", // Gray
          border: "rgba(107, 114, 128, 0.6)",
          text: "text-gray-700",
          borderLeft: "border-l-gray-500",
        };
      case "PENDING":
        return {
          bg: "rgba(234, 179, 8, 0.15)", // Yellow
          border: "rgba(234, 179, 8, 0.6)",
          text: "text-yellow-700",
          borderLeft: "border-l-yellow-400",
        };
      case "CANCELLED":
        return {
          bg: "rgba(239, 68, 68, 0.15)", // Red
          border: "rgba(239, 68, 68, 0.6)",
          text: "text-red-700",
          borderLeft: "border-l-red-500",
        };
      default:
        return {
          bg: "rgba(164, 227, 227, 0.15)",
          border: "rgba(164, 227, 227, 0.6)",
          text: "text-gray-700",
          borderLeft: "border-l-gray-300",
        };
    }
  };


  const statusColors = getStatusColor();
  const heightInPx = (booking.duration / 30) * 60;

  return (
    <div
      onClick={onClick}
      className={`absolute left-1 right-1 p-2 cursor-pointer border-l-4 shadow-sm hover:shadow-md transition-all ${statusColors.borderLeft}`}
      style={{
        backgroundColor: statusColors.bg,
        borderColor: statusColors.border,
        borderRadius: "8px",
        height: `${heightInPx}px`,
        minHeight: "50px",
      }}
    >
      <div className="flex items-center justify-center h-full">
        {/* Chỉ hiển thị tên khách hàng - đơn giản */}
        <p className={`text-sm font-bold ${statusColors.text} leading-tight text-center truncate w-full`}>
          {booking.customerName}
        </p>
      </div>
    </div>
  );
}
