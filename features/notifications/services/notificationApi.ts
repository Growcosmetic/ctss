// ============================================
// Notification API Service
// ============================================

import { Notification, NotificationResponse, CreateNotificationRequest } from "../types";

const API_BASE = "/api/notifications";

/**
 * GET /api/notifications
 */
export async function getNotifications(
  userId?: string,
  options?: {
    limit?: number;
    unreadOnly?: boolean;
  }
): Promise<NotificationResponse> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.unreadOnly) params.append("unreadOnly", "true");

    const response = await fetch(`${API_BASE}?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to get notifications");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw error;
  }
}

/**
 * POST /api/notifications/mark-read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/mark-read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationId }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * POST /api/notifications/mark-read (mark all)
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/mark-read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ markAllAsRead: true }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read");
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * POST /api/notifications/create
 */
export async function createNotification(
  request: CreateNotificationRequest
): Promise<Notification> {
  try {
    const response = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create notification");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

