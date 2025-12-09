"use client";

import React from "react";
import { Clock, User, Phone, CheckCircle, Scissors } from "lucide-react";

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

  const getStatusLabel = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "PENDING": return "Mới";
      case "CONFIRMED": return "Đã xác nhận";
      case "IN_PROGRESS": return "Đang làm";
      case "COMPLETED": return "Xong";
      case "CANCELLED": return "Hủy";
      default: return "";
    }
  };

  const statusColors = getStatusColor();
  const heightInPx = (booking.duration / 30) * 60;
  
  // Tìm tên stylist
  const stylist = stylists.find((s) => s.id === booking.stylistId);
  const stylistName = stylist?.name || "";

  // Xử lý click check-in
  const handleCheckInClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCheckIn && booking.id) {
      onCheckIn(booking.id);
    }
  };

  // Xử lý click gọi điện
  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall && booking.phone) {
      onCall(booking.phone);
    } else if (booking.phone) {
      window.location.href = `tel:${booking.phone}`;
    }
  };

  const canCheckIn = booking.status?.toUpperCase() === "PENDING" || 
                     booking.status?.toUpperCase() === "CONFIRMED";

  return (
    <div
      onClick={onClick}
      className={`absolute left-1 right-1 p-2 cursor-pointer border-l-4 shadow-sm hover:shadow-md transition-all ${statusColors.borderLeft}`}
      style={{
        backgroundColor: statusColors.bg,
        borderColor: statusColors.border,
        borderRadius: "8px",
        height: `${heightInPx}px`,
        minHeight: "60px",
      }}
    >
      <div className="flex items-start gap-2 h-full">
        <User className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: statusColors.border }} />
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Header: Time + Status */}
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-semibold text-gray-700">{booking.start}</span>
            </div>
            {booking.status && (
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-70 px-1.5 py-0.5 bg-white/50 rounded">
                {getStatusLabel(booking.status)}
              </span>
            )}
          </div>

          {/* Customer Name */}
          <p className={`text-xs font-bold truncate ${statusColors.text} mb-0.5`}>
            {booking.customerName}
          </p>

          {/* Phone - Clickable */}
          {booking.phone && (
            <div 
              onClick={handleCallClick}
              className="flex items-center gap-1 text-blue-600 text-[10px] mt-0.5 hover:underline cursor-pointer w-fit"
            >
              <Phone className="w-2.5 h-2.5" />
              <span>{booking.phone}</span>
            </div>
          )}

          {/* Service */}
          <div className="flex items-center gap-1 mt-1">
            <Scissors className="w-2.5 h-2.5 text-gray-500" />
            <p className="text-[10px] text-gray-600 truncate">
              {booking.serviceName}
            </p>
          </div>

          {/* Stylist */}
          {stylistName && (
            <div className="flex items-center gap-1 mt-1 bg-white/60 rounded-full px-1.5 py-0.5 w-fit border border-gray-100">
              <User className="w-2.5 h-2.5 text-purple-600" />
              <span className="text-[9px] font-medium text-purple-700">{stylistName}</span>
            </div>
          )}
        </div>

        {/* Quick Action: Check-in Button */}
        {canCheckIn && onCheckIn && (
          <button
            onClick={handleCheckInClick}
            className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white p-1 rounded-full shadow-sm transition-transform hover:scale-110"
            title="Check-in khách đến"
          >
            <CheckCircle className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
