"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationApi";
import { Notification } from "../types";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications(user.id, { limit: 50 });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, status: "READ" as const, readAt: new Date() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          status: "READ" as const,
          readAt: new Date(),
        }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  // Load on mount and when user changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [user?.id, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
}

