"use client";

import React from "react";
import { Notification, NotificationType } from "../types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  User,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  BOOKING_REMINDER_24H: <Clock className="w-4 h-4" />,
  BOOKING_REMINDER_2H: <Clock className="w-4 h-4" />,
  BOOKING_CREATED: <Calendar className="w-4 h-4" />,
  BOOKING_UPDATED: <Calendar className="w-4 h-4" />,
  BOOKING_CANCELLED: <XCircle className="w-4 h-4" />,
  BOOKING_NO_SHOW: <AlertTriangle className="w-4 h-4" />,
  CUSTOMER_ARRIVED: <User className="w-4 h-4" />,
  RETURN_VISIT_REMINDER: <Bell className="w-4 h-4" />,
  CUSTOMER_RISK: <AlertTriangle className="w-4 h-4" />,
  REVENUE_SUMMARY: <DollarSign className="w-4 h-4" />,
  STAFF_PERFORMANCE: <TrendingUp className="w-4 h-4" />,
  CHURN_RISK_ALERT: <AlertTriangle className="w-4 h-4" />,
  PRE_VISIT_SUMMARY: <User className="w-4 h-4" />,
  UPSELL_OPPORTUNITY: <TrendingUp className="w-4 h-4" />,
  SYSTEM_ALERT: <AlertTriangle className="w-4 h-4" />,
  INFO: <Bell className="w-4 h-4" />,
  SUCCESS: <CheckCircle className="w-4 h-4" />,
  WARNING: <AlertTriangle className="w-4 h-4" />,
  ERROR: <XCircle className="w-4 h-4" />,
};

const typeColors: Record<NotificationType, string> = {
  BOOKING_REMINDER_24H: "text-blue-600 bg-blue-50",
  BOOKING_REMINDER_2H: "text-orange-600 bg-orange-50",
  BOOKING_CREATED: "text-green-600 bg-green-50",
  BOOKING_UPDATED: "text-blue-600 bg-blue-50",
  BOOKING_CANCELLED: "text-red-600 bg-red-50",
  BOOKING_NO_SHOW: "text-red-600 bg-red-50",
  CUSTOMER_ARRIVED: "text-green-600 bg-green-50",
  RETURN_VISIT_REMINDER: "text-purple-600 bg-purple-50",
  CUSTOMER_RISK: "text-red-600 bg-red-50",
  REVENUE_SUMMARY: "text-green-600 bg-green-50",
  STAFF_PERFORMANCE: "text-blue-600 bg-blue-50",
  CHURN_RISK_ALERT: "text-red-600 bg-red-50",
  PRE_VISIT_SUMMARY: "text-purple-600 bg-purple-50",
  UPSELL_OPPORTUNITY: "text-green-600 bg-green-50",
  SYSTEM_ALERT: "text-orange-600 bg-orange-50",
  INFO: "text-blue-600 bg-blue-50",
  SUCCESS: "text-green-600 bg-green-50",
  WARNING: "text-orange-600 bg-orange-50",
  ERROR: "text-red-600 bg-red-50",
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const router = useRouter();
  const isUnread = notification.status === "UNREAD";

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification data
    if (notification.data) {
      if (notification.data.bookingId) {
        router.push(`/booking?bookingId=${notification.data.bookingId}`);
      } else if (notification.data.customerId) {
        router.push(`/crm?customerId=${notification.data.customerId}`);
      } else if (notification.data.invoiceId) {
        router.push(`/pos?invoiceId=${notification.data.invoiceId}`);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isUnread ? "bg-blue-50/30" : "bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${typeColors[notification.type]}`}
        >
          {typeIcons[notification.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>
            {isUnread && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

