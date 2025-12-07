// ============================================
// Notification Scheduler (CRON)
// ============================================

import { prisma } from "@/lib/prisma";
import { NotificationType, ReminderType } from "../types";
import { createSystemNotification } from "./notificationTriggers";
import { format } from "date-fns";

/**
 * Process due reminder jobs
 * This should be called every 5 minutes by a CRON job
 */
export async function processReminderJobs(): Promise<void> {
  try {
    const now = new Date();
    
    // Find all due reminder jobs
    const dueJobs = await prisma.reminderJob.findMany({
      where: {
        scheduledAt: {
          lte: now,
        },
        executed: false,
      },
      include: {
        booking: {
          include: {
            customer: true,
            staff: {
              include: {
                user: true,
              },
            },
          },
        },
        customer: true,
      },
    });

    for (const job of dueJobs) {
      try {
        await processReminderJob(job);
        
        // Mark as executed
        await prisma.reminderJob.update({
          where: { id: job.id },
          data: {
            executed: true,
            executedAt: now,
          },
        });
      } catch (error) {
        console.error(`Error processing reminder job ${job.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error processing reminder jobs:", error);
  }
}

/**
 * Process a single reminder job
 */
async function processReminderJob(job: any): Promise<void> {
  switch (job.type) {
    case ReminderType.APPOINTMENT_24H:
      await processAppointment24HReminder(job);
      break;
    case ReminderType.APPOINTMENT_2H:
      await processAppointment2HReminder(job);
      break;
    case ReminderType.RETURN_VISIT:
      await processReturnVisitReminder(job);
      break;
  }
}

/**
 * Process 24h appointment reminder
 */
async function processAppointment24HReminder(job: any): Promise<void> {
  if (!job.booking) return;

  const booking = job.booking;
  const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
  const bookingDate = format(new Date(booking.bookingTime), "dd/MM/yyyy HH:mm");

  // Notify customer (via SMS/Email placeholder - would integrate with SMS/Email service)
  // For now, we'll notify the staff
  if (booking.staff?.user) {
    await createSystemNotification(NotificationType.BOOKING_REMINDER_24H, {
      userId: booking.staff.user.id,
      title: "Nhắc nhở lịch hẹn 24h",
      message: `Lịch hẹn với khách ${customerName} vào ${bookingDate} sẽ diễn ra sau 24 giờ.`,
      data: {
        bookingId: booking.id,
        customerId: booking.customerId,
        reminderType: "24H",
      },
    });
  }

  // TODO: Send SMS/Email to customer
  console.log(`[SMS/Email] Reminder to customer: ${customerName} - Booking at ${bookingDate}`);
}

/**
 * Process 2h appointment reminder
 */
async function processAppointment2HReminder(job: any): Promise<void> {
  if (!job.booking) return;

  const booking = job.booking;
  const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
  const bookingDate = format(new Date(booking.bookingTime), "dd/MM/yyyy HH:mm");

  // Notify stylist
  if (booking.staff?.user) {
    await createSystemNotification(NotificationType.BOOKING_REMINDER_2H, {
      userId: booking.staff.user.id,
      title: "Nhắc nhở lịch hẹn 2h",
      message: `Lịch hẹn với khách ${customerName} vào ${bookingDate} sẽ diễn ra sau 2 giờ.`,
      data: {
        bookingId: booking.id,
        customerId: booking.customerId,
        reminderType: "2H",
      },
    });

    // Trigger pre-visit summary
    await triggerPreVisitSummary(booking.id);
  }

  // TODO: Send SMS/Email to customer
  console.log(`[SMS/Email] Reminder to customer: ${customerName} - Booking at ${bookingDate}`);
}

/**
 * Process return visit reminder
 */
async function processReturnVisitReminder(job: any): Promise<void> {
  if (!job.customer) return;

  const customer = job.customer;
  const customerName = `${customer.firstName} ${customer.lastName}`;

  // Notify receptionist to follow up
  const receptionists = await prisma.user.findMany({
    where: {
      role: "RECEPTIONIST",
      isActive: true,
    },
  });

  if (receptionists.length > 0) {
    await createBulkNotifications(NotificationType.RETURN_VISIT_REMINDER, {
      userIds: receptionists.map((r) => r.id),
      title: "Nhắc nhở khách quay lại",
      message: `Khách ${customerName} đã đến thời điểm nên quay lại. Hãy liên hệ để đặt lịch.`,
      data: {
        customerId: customer.id,
      },
    });
  }

  // TODO: Send SMS/Email to customer
  console.log(`[SMS/Email] Return visit reminder to customer: ${customerName}`);
}

// Import helper function
async function createBulkNotifications(
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

// triggerPreVisitSummary is imported from notificationTriggers

