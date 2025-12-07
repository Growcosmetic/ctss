"use client";

import React from "react";
import { TimelineSlot } from "../types";
import { format } from "date-fns";

interface BookingTimelineProps {
  timeline: TimelineSlot[];
}

export default function BookingTimeline({ timeline }: BookingTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "in-service":
        return "bg-green-100 border-green-300 text-green-800";
      case "completed":
        return "bg-gray-100 border-gray-300 text-gray-600";
      case "no-show":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-600";
    }
  };

  // Group slots by hour for better display
  const hourlySlots = timeline.reduce((acc, slot) => {
    const hour = slot.time.split(":")[0];
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(slot);
    return acc;
  }, {} as Record<string, typeof timeline>);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Lịch hẹn hôm nay</h2>
      </div>
      <div className="p-6 overflow-x-auto">
        <div className="space-y-4">
          {Object.entries(hourlySlots).map(([hour, slots]) => (
            <div key={hour} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-3">
                <h3 className="font-semibold text-gray-900 w-16">{hour}:00</h3>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.time}
                      className={`p-3 rounded-lg border ${
                        slot.isCurrentTime
                          ? "bg-blue-50 border-blue-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        {slot.time}
                        {slot.isCurrentTime && (
                          <span className="ml-2 text-blue-600">● Đang diễn ra</span>
                        )}
                      </div>
                      {slot.bookings.length > 0 ? (
                        <div className="space-y-1">
                          {slot.bookings.map((booking) => (
                            <div
                              key={booking.id}
                              className={`p-2 rounded text-xs ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              <div className="font-medium">{booking.customerName}</div>
                              <div className="text-xs opacity-75 truncate">
                                {booking.serviceName}
                              </div>
                              <div className="text-xs opacity-75">
                                {booking.stylistName}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">Trống</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

