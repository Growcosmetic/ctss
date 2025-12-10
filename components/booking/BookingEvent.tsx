"use client";

import React, { useMemo } from "react";
import { Clock } from "lucide-react";

interface BookingEventProps {
  booking: any;
  onClick?: () => void;
  onCheckIn?: (id: string) => void;
  onCall?: (phone: string) => void;
  stylists?: Array<{ id: string; name: string }>;
  onQuickEdit?: (booking: any, field: "time" | "stylist" | "service") => void;
}

export default function BookingEvent({ 
  booking, 
  onClick, 
  onCheckIn,
  onCall,
  stylists = [],
  onQuickEdit
}: BookingEventProps) {
  // Tính toán thời gian còn lại đến booking
  const timeUntilBooking = useMemo(() => {
    if (!booking.date || !booking.start) return null;
    
    const bookingDateTime = new Date(`${booking.date}T${booking.start}`);
    const now = new Date();
    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return diffMinutes;
  }, [booking.date, booking.start]);

  // Kiểm tra booking sắp đến (< 30 phút)
  const isUpcoming = timeUntilBooking !== null && timeUntilBooking > 0 && timeUntilBooking <= 30;
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

  const handleTimeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickEdit) {
      onQuickEdit(booking, "time");
    }
  };

  const handleStylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickEdit) {
      onQuickEdit(booking, "stylist");
    }
  };

  const handleServiceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickEdit) {
      onQuickEdit(booking, "service");
    }
  };

  return (
    <div
      onClick={onClick}
      className={`absolute left-1 right-1 p-2 cursor-pointer border-l-4 shadow-sm hover:shadow-md transition-all ${statusColors.borderLeft} relative`}
      style={{
        backgroundColor: statusColors.bg,
        borderColor: statusColors.border,
        borderRadius: "8px",
        height: `${heightInPx}px`,
        minHeight: "50px",
      }}
    >
      {/* Badge "Sắp đến" */}
      {isUpcoming && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10">
          <Clock className="w-2.5 h-2.5" />
          <span>Sắp đến</span>
        </div>
      )}
      
      <div className="flex flex-col justify-center h-full">
        {/* Tên khách hàng */}
        <p className={`text-sm font-bold ${statusColors.text} leading-tight text-center truncate w-full`}>
          {booking.customerName}
        </p>
        
        {/* Thời gian - có thể click để edit */}
        {booking.start && (
          <p 
            onClick={handleTimeClick}
            className={`text-xs ${statusColors.text} opacity-75 text-center cursor-pointer hover:underline`}
            title="Click để sửa thời gian"
          >
            {booking.start}
          </p>
        )}
        
        {/* Stylist - có thể click để edit */}
        {booking.stylistId && stylists.length > 0 && (
          <p 
            onClick={handleStylistClick}
            className={`text-xs ${statusColors.text} opacity-60 text-center cursor-pointer hover:underline truncate`}
            title="Click để đổi stylist"
          >
            {stylists.find(s => s.id === booking.stylistId)?.name || ""}
          </p>
        )}
      </div>
    </div>
  );
}
