"use client";

import React from "react";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Bell, Calendar, User, AlertTriangle, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function StaffNotifications() {
  const { notifications, unreadCount } = useNotifications();
  const router = useRouter();

  // Filter staff-related notifications
  const staffNotifications = notifications.filter((notif) =>
    [
      "BOOKING_CREATED",
      "BOOKING_UPDATED",
      "CUSTOMER_ARRIVED",
      "PRE_VISIT_SUMMARY",
      "CUSTOMER_RISK",
    ].includes(notif.type)
  );

  if (staffNotifications.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "BOOKING_CREATED":
      case "BOOKING_UPDATED":
        return <Calendar className="w-4 h-4" />;
      case "CUSTOMER_ARRIVED":
        return <User className="w-4 h-4" />;
      case "PRE_VISIT_SUMMARY":
        return <Sparkles className="w-4 h-4" />;
      case "CUSTOMER_RISK":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const handleClick = (notif: any) => {
    if (notif.data) {
      if (notif.data.bookingId) {
        router.push(`/staff?bookingId=${notif.data.bookingId}`);
      } else if (notif.data.customerId) {
        router.push(`/staff?customerId=${notif.data.customerId}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Thông báo</h3>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {staffNotifications.slice(0, 5).map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleClick(notif)}
            className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
              notif.status === "UNREAD"
                ? "bg-blue-50 border-blue-200"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {notif.title}
                </div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {notif.message}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

