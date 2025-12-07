// ============================================
// Notification Triggers
// ============================================

import { prisma } from "@/lib/prisma";
import { NotificationType, ReminderType } from "../types";
import { predictReturnDate } from "@/features/mina/services/minaEngine";
import { addHours, addDays, parseISO, format } from "date-fns";

/**
 * Create a system notification
 */
export async function createSystemNotification(
  type: NotificationType,
  payload: {
    userId: string;
    title: string;
    message: string;
    data?: any;
  }
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        type,
        title: payload.title,
        message: payload.message,
        data: payload.data || {},
        status: "UNREAD",
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

/**
 * Create notification for multiple users
 */
export async function createBulkNotifications(
  type: NotificationType,
  payload: {
    userIds: string[];
    title: string;
    message: string;
    data?: any;
  }
): Promise<void> {
  try {
    await prisma.notification.createMany({
      data: payload.userIds.map((userId) => ({
        userId,
        type,
        title: payload.title,
        message: payload.message,
        data: payload.data || {},
        status: "UNREAD",
      })),
    });
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
  }
}

// ============================================
// BOOKING TRIGGERS
// ============================================

/**
 * Trigger: Booking Created
 */
export async function triggerBookingCreated(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        staff: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
    });

    if (!booking) return;

    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    const bookingDate = format(new Date(booking.bookingTime), "dd/MM/yyyy HH:mm");

    // Notify receptionist (creator)
    if (booking.createdBy) {
      await createSystemNotification(NotificationType.BOOKING_CREATED, {
        userId: booking.createdBy.id,
        title: "Lịch hẹn mới được tạo",
        message: `Lịch hẹn cho khách ${customerName} vào ${bookingDate} đã được tạo.`,
        data: { bookingId, customerId: booking.customerId },
      });
    }

    // Notify assigned stylist
    if (booking.staff?.user) {
      await createSystemNotification(NotificationType.BOOKING_CREATED, {
        userId: booking.staff.user.id,
        title: "Bạn có lịch hẹn mới",
        message: `Khách ${customerName} đã đặt lịch với bạn vào ${bookingDate}.`,
        data: { bookingId, customerId: booking.customerId },
      });

      // Schedule reminder jobs for stylist
      const bookingTime = new Date(booking.bookingTime);
      
      // 24h reminder
      await prisma.reminderJob.create({
        data: {
          bookingId: booking.id,
          type: ReminderType.APPOINTMENT_24H,
          scheduledAt: addHours(bookingTime, -24),
        },
      });

      // 2h reminder
      await prisma.reminderJob.create({
        data: {
          bookingId: booking.id,
          type: ReminderType.APPOINTMENT_2H,
          scheduledAt: addHours(bookingTime, -2),
        },
      });
    }
  } catch (error) {
    console.error("Error triggering booking created:", error);
  }
}

/**
 * Trigger: Booking Updated
 */
export async function triggerBookingUpdated(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        staff: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking || !booking.staff?.user) return;

    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    const bookingDate = format(new Date(booking.bookingTime), "dd/MM/yyyy HH:mm");

    await createSystemNotification(NotificationType.BOOKING_UPDATED, {
      userId: booking.staff.user.id,
      title: "Lịch hẹn đã được cập nhật",
      message: `Lịch hẹn với khách ${customerName} vào ${bookingDate} đã được thay đổi.`,
      data: { bookingId, customerId: booking.customerId },
    });
  } catch (error) {
    console.error("Error triggering booking updated:", error);
  }
}

/**
 * Trigger: Booking Cancelled
 */
export async function triggerBookingCancelled(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        staff: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
    });

    if (!booking) return;

    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
    const bookingDate = format(new Date(booking.bookingTime), "dd/MM/yyyy HH:mm");

    const userIds: string[] = [];

    if (booking.staff?.user) {
      userIds.push(booking.staff.user.id);
    }
    if (booking.createdBy) {
      userIds.push(booking.createdBy.id);
    }

    if (userIds.length > 0) {
      await createBulkNotifications(NotificationType.BOOKING_CANCELLED, {
        userIds,
        title: "Lịch hẹn đã bị hủy",
        message: `Lịch hẹn với khách ${customerName} vào ${bookingDate} đã bị hủy.`,
        data: { bookingId, customerId: booking.customerId },
      });
    }
  } catch (error) {
    console.error("Error triggering booking cancelled:", error);
  }
}

/**
 * Trigger: Booking No-Show
 */
export async function triggerBookingNoShow(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        staff: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking) return;

    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;

    // Notify manager
    const managers = await prisma.user.findMany({
      where: {
        role: "MANAGER",
        isActive: true,
      },
    });

    if (managers.length > 0) {
      await createBulkNotifications(NotificationType.BOOKING_NO_SHOW, {
        userIds: managers.map((m) => m.id),
        title: "Khách hàng không đến (No-Show)",
        message: `Khách ${customerName} đã không đến lịch hẹn.`,
        data: { bookingId, customerId: booking.customerId },
      });
    }

    // Notify stylist
    if (booking.staff?.user) {
      await createSystemNotification(NotificationType.BOOKING_NO_SHOW, {
        userId: booking.staff.user.id,
        title: "Khách hàng không đến",
        message: `Khách ${customerName} đã không đến lịch hẹn.`,
        data: { bookingId, customerId: booking.customerId },
      });
    }
  } catch (error) {
    console.error("Error triggering booking no-show:", error);
  }
}

// ============================================
// POS TRIGGERS
// ============================================

/**
 * Trigger: After Payment (Schedule Return Reminder)
 */
export async function triggerAfterPayment(
  customerId: string,
  invoiceId: string
): Promise<void> {
  try {
    // Get Mina prediction for return date
    const prediction = await predictReturnDate(customerId);

    if (prediction && prediction.predictedDate) {
      const returnDate = parseISO(prediction.predictedDate);
      const reminderDate = addDays(returnDate, -3); // Remind 3 days before predicted return

      await prisma.reminderJob.create({
        data: {
          customerId,
          type: ReminderType.RETURN_VISIT,
          scheduledAt: reminderDate,
        },
      });
    }
  } catch (error) {
    console.error("Error triggering after payment:", error);
  }
}

// ============================================
// CRM TRIGGERS
// ============================================

/**
 * Trigger: High-Risk Customer
 */
export async function triggerHighRiskCustomer(customerId: string): Promise<void> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) return;

    const customerName = `${customer.firstName} ${customer.lastName}`;

    // Notify manager
    const managers = await prisma.user.findMany({
      where: {
        role: { in: ["MANAGER", "ADMIN"] },
        isActive: true,
      },
    });

    if (managers.length > 0) {
      await createBulkNotifications(NotificationType.CUSTOMER_RISK, {
        userIds: managers.map((m) => m.id),
        title: "Khách hàng có rủi ro cao",
        message: `Khách ${customerName} có dấu hiệu rủi ro (churn risk). Cần theo dõi.`,
        data: { customerId },
      });
    }
  } catch (error) {
    console.error("Error triggering high-risk customer:", error);
  }
}

// ============================================
// MINA TRIGGERS
// ============================================

/**
 * Trigger: Pre-Visit Summary (30 min before booking)
 */
export async function triggerPreVisitSummary(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        staff: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking || !booking.staff?.user) return;

    const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;

    // This would typically call Mina to generate summary
    // For now, create a simple notification
    await createSystemNotification(NotificationType.PRE_VISIT_SUMMARY, {
      userId: booking.staff.user.id,
      title: "Tóm tắt khách hàng trước khi đến",
      message: `Khách ${customerName} sắp đến. Xem tóm tắt lịch sử và gợi ý dịch vụ.`,
      data: { bookingId, customerId: booking.customerId },
    });
  } catch (error) {
    console.error("Error triggering pre-visit summary:", error);
  }
}

