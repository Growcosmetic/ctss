// ============================================
// Customer Segmentation Engine
// ============================================

import { prisma } from "@/lib/prisma";

export type CustomerSegment =
  | "recent_uon"
  | "recent_nhuom"
  | "not_return_60"
  | "vip"
  | "high_risk"
  | "all";

export interface SegmentedCustomer {
  customerId: string;
  phone?: string;
  name?: string;
  profile: any;
}

// ============================================
// Helper: Calculate days since date
// ============================================

function daysSince(date: Date | string): number {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return Math.floor(
    (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ============================================
// Segment Customers by Criteria
// ============================================

export async function segmentCustomers(
  segment: CustomerSegment
): Promise<SegmentedCustomer[]> {
  // Get all customers with profiles
  const profiles = await prisma.customerProfile.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          bookings: {
            orderBy: { date: "desc" },
            take: 5,
            include: {
              service: {
                select: { name: true, category: true },
              },
            },
          },
        },
      },
    },
  });

  switch (segment) {
    case "recent_uon": {
      // Khách mới uốn trong 30 ngày
      return profiles
        .filter((profile) => {
          const bookings = profile.customer?.bookings || [];
          return bookings.some((booking: any) => {
            const daysAgo = daysSince(booking.date);
            const serviceName = booking.service?.name?.toLowerCase() || "";
            return (
              daysAgo <= 30 &&
              (serviceName.includes("uốn") ||
                serviceName.includes("perm") ||
                serviceName.includes("curl"))
            );
          });
        })
        .map((profile) => ({
          customerId: profile.customerId,
          phone: profile.phone || profile.customer?.phone,
          name: profile.name || profile.customer?.name,
          profile,
        }));
    }

    case "recent_nhuom": {
      // Khách mới nhuộm trong 30 ngày
      return profiles
        .filter((profile) => {
          const bookings = profile.customer?.bookings || [];
          return bookings.some((booking: any) => {
            const daysAgo = daysSince(booking.date);
            const serviceName = booking.service?.name?.toLowerCase() || "";
            return (
              daysAgo <= 30 &&
              (serviceName.includes("nhuộm") ||
                serviceName.includes("color") ||
                serviceName.includes("dye") ||
                serviceName.includes("balayage"))
            );
          });
        })
        .map((profile) => ({
          customerId: profile.customerId,
          phone: profile.phone || profile.customer?.phone,
          name: profile.name || profile.customer?.name,
          profile,
        }));
    }

    case "not_return_60": {
      // 60 ngày chưa quay lại
      return profiles
        .filter((profile) => {
          const bookings = profile.customer?.bookings || [];
          if (bookings.length === 0) return false;

          const lastBooking = bookings[0];
          const daysAgo = daysSince(lastBooking.date);

          return daysAgo >= 60;
        })
        .map((profile) => ({
          customerId: profile.customerId,
          phone: profile.phone || profile.customer?.phone,
          name: profile.name || profile.customer?.name,
          profile,
        }));
    }

    case "vip": {
      // Khách VIP dựa trên insight hoặc lifetime value
      return profiles
        .filter((profile) => {
          const insight = profile.insight as any;
          if (insight?.loyaltyScore && insight.loyaltyScore >= 80) return true;

          // Check lifetime value from invoices (if available)
          // This would require joining with invoices, simplified here
          return false;
        })
        .map((profile) => ({
          customerId: profile.customerId,
          phone: profile.phone || profile.customer?.phone,
          name: profile.name || profile.customer?.name,
          profile,
        }));
    }

    case "high_risk": {
      // Khách có nguy cơ rời salon
      return profiles
        .filter((profile) => {
          const insight = profile.insight as any;
          const risks = insight?.risks || [];
          const riskStrings = JSON.stringify(risks).toLowerCase();

          // Check for risk indicators
          if (
            riskStrings.includes("churn") ||
            riskStrings.includes("long time no return") ||
            riskStrings.includes("unsatisfied") ||
            insight?.churnProbability > 50
          ) {
            return true;
          }

          // Check last visit
          const bookings = profile.customer?.bookings || [];
          if (bookings.length > 0) {
            const lastBooking = bookings[0];
            const daysAgo = daysSince(lastBooking.date);
            if (daysAgo >= 90) return true;
          }

          return false;
        })
        .map((profile) => ({
          customerId: profile.customerId,
          phone: profile.phone || profile.customer?.phone,
          name: profile.name || profile.customer?.name,
          profile,
        }));
    }

    case "all":
    default: {
      // All customers
      return profiles.map((profile) => ({
        customerId: profile.customerId,
        phone: profile.phone || profile.customer?.phone,
        name: profile.name || profile.customer?.name,
        profile,
      }));
    }
  }
}

// ============================================
// Get Segment Info
// ============================================

export function getSegmentInfo(segment: CustomerSegment): {
  label: string;
  description: string;
} {
  const info: Record<CustomerSegment, { label: string; description: string }> =
    {
      recent_uon: {
        label: "Khách mới uốn (30 ngày)",
        description: "Khách đã uốn tóc trong vòng 30 ngày gần đây",
      },
      recent_nhuom: {
        label: "Khách mới nhuộm (30 ngày)",
        description: "Khách đã nhuộm tóc trong vòng 30 ngày gần đây",
      },
      not_return_60: {
        label: "Khách 60 ngày chưa quay lại",
        description: "Khách chưa quay lại salon trong 60 ngày trở lên",
      },
      vip: {
        label: "Khách VIP",
        description: "Khách hàng trung thành với loyalty score cao",
      },
      high_risk: {
        label: "Khách rủi ro cao",
        description: "Khách có nguy cơ rời salon hoặc churn",
      },
      all: {
        label: "Tất cả khách hàng",
        description: "Gửi đến tất cả khách hàng trong hệ thống",
      },
    };

  return info[segment] || info.all;
}

