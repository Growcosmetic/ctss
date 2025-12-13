/**
 * Phase 10.2 - Alert Rules Engine
 * 
 * Defines rule-based alerts that can be checked periodically
 */

import { prisma } from "../prisma";
import { AlertType, AlertSeverity } from "@prisma/client";
import { startOfDay, endOfDay, addDays, isAfter, isBefore } from "date-fns";

export interface AlertRuleConfig {
  type: AlertType;
  severity: AlertSeverity;
  name: string;
  description: string;
  check: (salonId: string) => Promise<AlertCheckResult | null>;
}

export interface AlertCheckResult {
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Default alert rules
 */
export const DEFAULT_ALERT_RULES: AlertRuleConfig[] = [
  // Booking overdue
  {
    type: AlertType.BOOKING_OVERDUE,
    severity: AlertSeverity.HIGH,
    name: "Lịch hẹn quá hạn",
    description: "Cảnh báo khi có lịch hẹn đã quá thời gian nhưng chưa hoàn thành",
    check: async (salonId: string) => {
      const now = new Date();
      const overdueBookings = await prisma.booking.findMany({
        where: {
          salonId,
          status: { in: ["PENDING", "CONFIRMED"] },
          date: { lt: now },
        },
        take: 10,
        include: {
          customer: { select: { name: true } },
        },
      });

      if (overdueBookings.length > 0) {
        return {
          title: `${overdueBookings.length} lịch hẹn quá hạn`,
          message: `Có ${overdueBookings.length} lịch hẹn đã quá thời gian nhưng chưa được xử lý.`,
          metadata: {
            count: overdueBookings.length,
            bookingIds: overdueBookings.map((b) => b.id),
          },
        };
      }
      return null;
    },
  },

  // Booking conflicts
  {
    type: AlertType.BOOKING_CONFLICT,
    severity: AlertSeverity.MEDIUM,
    name: "Lịch hẹn trùng lịch",
    description: "Cảnh báo khi có lịch hẹn trùng thời gian",
    check: async (salonId: string) => {
      // This would require more complex logic to detect conflicts
      // For now, we'll check for bookings with same time and staff
      const today = startOfDay(new Date());
      const tomorrow = endOfDay(addDays(today, 1));

      const bookings = await prisma.booking.findMany({
        where: {
          salonId,
          date: { gte: today, lte: tomorrow },
          stylistId: { not: null },
        },
        select: {
          id: true,
          date: true,
          stylistId: true,
        },
      });

      // Group by staff and time (simplified - check same hour)
      const conflicts: string[] = [];
      const staffTimeMap = new Map<string, Set<string>>();

      for (const booking of bookings) {
        if (!booking.stylistId) continue;
        const timeKey = booking.date.toISOString().slice(0, 13); // Hour precision
        const key = `${booking.stylistId}-${timeKey}`;

        if (staffTimeMap.has(key)) {
          conflicts.push(booking.id);
        } else {
          staffTimeMap.set(key, new Set([booking.id]));
        }
      }

      if (conflicts.length > 0) {
        return {
          title: `${conflicts.length} lịch hẹn có thể trùng lịch`,
          message: `Phát hiện ${conflicts.length} lịch hẹn có thể trùng thời gian. Vui lòng kiểm tra lại.`,
          metadata: {
            count: conflicts.length,
            bookingIds: conflicts,
          },
        };
      }
      return null;
    },
  },

  // Low stock
  {
    type: AlertType.LOW_STOCK,
    severity: AlertSeverity.MEDIUM,
    name: "Hàng tồn kho thấp",
    description: "Cảnh báo khi sản phẩm có số lượng tồn kho thấp",
    check: async (salonId: string) => {
      const lowStockProducts = await prisma.product.findMany({
        where: {
          salonId,
          isActive: true,
          OR: [
            { stock: { lte: 10 } }, // Stock ≤ 10
            { 
              AND: [
                { stock: { not: null } },
                { minStock: { not: null } },
                { stock: { lte: prisma.product.fields.minStock } }, // Stock ≤ minStock
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          stock: true,
          minStock: true,
        },
        take: 10,
      });

      if (lowStockProducts.length > 0) {
        return {
          title: `${lowStockProducts.length} sản phẩm sắp hết hàng`,
          message: `Có ${lowStockProducts.length} sản phẩm có số lượng tồn kho thấp. Vui lòng nhập hàng.`,
          metadata: {
            count: lowStockProducts.length,
            products: lowStockProducts.map((p) => ({
              id: p.id,
              name: p.name,
              stock: p.stock || 0,
              minStock: p.minStock,
            })),
          },
        };
      }
      return null;
    },
  },

  // Customer birthdays (today)
  {
    type: AlertType.CUSTOMER_BIRTHDAY,
    severity: AlertSeverity.LOW,
    name: "Sinh nhật khách hàng",
    description: "Nhắc nhở sinh nhật khách hàng hôm nay",
    check: async (salonId: string) => {
      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();

      // Note: This is simplified - assumes birthday is stored as Date
      // In reality, we'd need to check month/day only
      const customers = await prisma.customer.findMany({
        where: {
          salonId,
          birthday: { not: null },
        },
        select: {
          id: true,
          name: true,
          birthday: true,
        },
        take: 100, // Limit for performance
      });

      const birthdayCustomers = customers.filter((c) => {
        if (!c.birthday) return false;
        const bd = new Date(c.birthday);
        return bd.getMonth() + 1 === todayMonth && bd.getDate() === todayDay;
      });

      if (birthdayCustomers.length > 0) {
        return {
          title: `${birthdayCustomers.length} khách hàng có sinh nhật hôm nay`,
          message: `Hôm nay là sinh nhật của ${birthdayCustomers.length} khách hàng. Hãy gửi lời chúc mừng!`,
          metadata: {
            count: birthdayCustomers.length,
            customers: birthdayCustomers.map((c) => ({
              id: c.id,
              name: c.name,
            })),
          },
        };
      }
      return null;
    },
  },

  // Subscription expiring
  {
    type: AlertType.SUBSCRIPTION_EXPIRING,
    severity: AlertSeverity.HIGH,
    name: "Gói dịch vụ sắp hết hạn",
    description: "Cảnh báo khi gói dịch vụ sắp hết hạn",
    check: async (salonId: string) => {
      const subscription = await prisma.subscription.findUnique({
        where: { salonId },
        include: { plan: true },
      });

      if (!subscription) return null;

      const expiresAt = subscription.currentPeriodEndsAt || subscription.trialEndsAt;
      if (!expiresAt) return null;

      const daysUntilExpiry = Math.ceil(
        (expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        return {
          title: `Gói dịch vụ sẽ hết hạn trong ${daysUntilExpiry} ngày`,
          message: `Gói ${subscription.plan?.displayName || "hiện tại"} sẽ hết hạn vào ${expiresAt.toLocaleDateString("vi-VN")}. Vui lòng gia hạn để tiếp tục sử dụng.`,
          metadata: {
            planName: subscription.plan?.displayName,
            expiresAt: expiresAt.toISOString(),
            daysUntilExpiry,
          },
        };
      }

      if (daysUntilExpiry <= 0) {
        return {
          title: "Gói dịch vụ đã hết hạn",
          message: `Gói ${subscription.plan?.displayName || "hiện tại"} đã hết hạn. Vui lòng gia hạn ngay để tiếp tục sử dụng.`,
          metadata: {
            planName: subscription.plan?.displayName,
            expiresAt: expiresAt.toISOString(),
            expired: true,
          },
        };
      }

      return null;
    },
  },
];

/**
 * Run all alert rules for a salon
 */
export async function runAlertRules(salonId: string): Promise<void> {
  console.log(`[Alerts] Running alert rules for salon ${salonId}`);

  for (const rule of DEFAULT_ALERT_RULES) {
    try {
      const result = await rule.check(salonId);

      if (result) {
        // Check if alert already exists (avoid duplicates)
        const existingAlert = await prisma.systemAlert.findFirst({
          where: {
            salonId,
            type: rule.type,
            status: "ACTIVE",
            createdAt: {
              gte: startOfDay(new Date()), // Only check today's alerts
            },
          },
        });

        if (!existingAlert) {
          await prisma.systemAlert.create({
            data: {
              salonId,
              type: rule.type,
              severity: rule.severity,
              title: result.title,
              message: result.message,
              metadata: result.metadata || {},
              status: "ACTIVE",
            },
          });

          console.log(`[Alerts] Created alert: ${rule.type} for salon ${salonId}`);
        }
      }
    } catch (error: any) {
      console.error(`[Alerts] Error running rule ${rule.type}:`, error);
    }
  }
}

/**
 * Run alert rules for all active salons
 */
export async function runAlertRulesForAllSalons(): Promise<void> {
  const salons = await prisma.salon.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });

  console.log(`[Alerts] Running alert rules for ${salons.length} salons`);

  for (const salon of salons) {
    await runAlertRules(salon.id);
  }
}

