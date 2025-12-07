"use client";

import React from "react";
import { Notification } from "../types";
import NotificationItem from "./NotificationItem";
import { Loader2, BellOff } from "lucide-react";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  loading?: boolean;
}

export default function NotificationList({
  notifications,
  onMarkAsRead,
  loading,
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <BellOff className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm">Không có thông báo nào</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}

