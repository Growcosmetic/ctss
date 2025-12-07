// ============================================
// Notification Types
// ============================================

export enum NotificationType {
  BOOKING_REMINDER_24H = "BOOKING_REMINDER_24H",
  BOOKING_REMINDER_2H = "BOOKING_REMINDER_2H",
  BOOKING_CREATED = "BOOKING_CREATED",
  BOOKING_UPDATED = "BOOKING_UPDATED",
  BOOKING_CANCELLED = "BOOKING_CANCELLED",
  BOOKING_NO_SHOW = "BOOKING_NO_SHOW",
  CUSTOMER_ARRIVED = "CUSTOMER_ARRIVED",
  RETURN_VISIT_REMINDER = "RETURN_VISIT_REMINDER",
  CUSTOMER_RISK = "CUSTOMER_RISK",
  REVENUE_SUMMARY = "REVENUE_SUMMARY",
  STAFF_PERFORMANCE = "STAFF_PERFORMANCE",
  CHURN_RISK_ALERT = "CHURN_RISK_ALERT",
  PRE_VISIT_SUMMARY = "PRE_VISIT_SUMMARY",
  UPSELL_OPPORTUNITY = "UPSELL_OPPORTUNITY",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

export enum ReminderType {
  APPOINTMENT_24H = "APPOINTMENT_24H",
  APPOINTMENT_2H = "APPOINTMENT_2H",
  RETURN_VISIT = "RETURN_VISIT",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  status: NotificationStatus;
  createdAt: Date;
  readAt?: Date | null;
}

export interface ReminderJob {
  id: string;
  bookingId?: string | null;
  customerId?: string | null;
  type: ReminderType;
  scheduledAt: Date;
  executed: boolean;
  executedAt?: Date | null;
  createdAt: Date;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

