"use client";

import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Clock, User, Scissors } from "lucide-react";

interface Booking {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  staff?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  bookingTime: string;
  duration: number;
  status: string;
  totalAmount: number;
  bookingServices: Array<{
    service: {
      name: string;
    };
  }>;
}

interface BookingCardProps {
  booking: Booking;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick?: () => void;
  className?: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 border-yellow-300 text-yellow-800",
  CONFIRMED: "bg-blue-100 border-blue-300 text-blue-800",
  IN_PROGRESS: "bg-purple-100 border-purple-300 text-purple-800",
  COMPLETED: "bg-green-100 border-green-300 text-green-800",
  CANCELLED: "bg-red-100 border-red-300 text-red-800",
  NO_SHOW: "bg-gray-100 border-gray-300 text-gray-800",
};

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onDragStart,
  onDragEnd,
  onClick,
  className,
}) => {
  const statusColor = statusColors[booking.status] || statusColors.PENDING;
  const bookingTime = new Date(booking.bookingTime);
  const endTime = new Date(bookingTime.getTime() + booking.duration * 60000);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "absolute left-1 right-1 rounded-lg border p-2 cursor-move hover:shadow-md transition-all",
        "bg-white",
        statusColor,
        className
      )}
      style={{
        height: `${Math.max((booking.duration / 15) * 15, 50)}px`, // 15px per 15 minutes
        minHeight: "50px",
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs truncate">
              {booking.customer.firstName} {booking.customer.lastName}
            </p>
            <p className="text-xs opacity-75 truncate">
              {booking.customer.phone}
            </p>
          </div>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-white/50">
            {formatCurrency(booking.totalAmount)}
          </span>
        </div>

        <div className="flex-1 space-y-0.5">
          {booking.bookingServices.slice(0, 2).map((item, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <Scissors className="w-3 h-3" />
              <span className="truncate">{item.service.name}</span>
            </div>
          ))}
          {booking.bookingServices.length > 2 && (
            <p className="text-xs opacity-75">
              +{booking.bookingServices.length - 2} dịch vụ khác
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-1 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {format(bookingTime, "HH:mm")} - {format(endTime, "HH:mm")}
            </span>
          </div>
          {booking.staff && (
            <div className="flex items-center gap-1 opacity-75">
              <User className="w-3 h-3" />
              <span className="truncate">
                {booking.staff.user.firstName} {booking.staff.user.lastName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

