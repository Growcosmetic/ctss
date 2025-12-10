// ============================================
// Customer360 Data Engine
// ============================================

import { prisma } from "@/lib/prisma";
import {
  Customer360Core,
  CustomerBookingHistory,
  CustomerInvoiceHistory,
  CustomerProductHistory,
  CustomerLoyaltyInfo,
  CustomerVisitFrequency,
  CustomerServicePattern,
} from "../types";
import { differenceInDays, addDays } from "date-fns";

// ============================================
// 1. Get Customer Core
// ============================================

export async function getCustomerCore(
  customerId: string
): Promise<Customer360Core> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`);
  }

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    gender: customer.gender ?? undefined,
    birthday: customer.birthday?.toISOString() ?? null,
    notes: customer.notes ?? null,
    journeyState: (customer.journeyState as any) ?? "AWARENESS",
    createdAt: customer.createdAt.toISOString(),
  };
}

// ============================================
// 2. Get Booking History
// ============================================

export async function getBookingHistory(
  customerId: string
): Promise<CustomerBookingHistory[]> {
  try {
    // Try to get bookings first
    const bookings = await prisma.booking.findMany({
      where: { customerId },
      include: {
        service: {
          select: {
            name: true,
          },
        },
        stylist: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      date: booking.date.toISOString(),
      serviceName: booking.service?.name,
      stylistName: booking.stylist?.name,
      branchName: booking.branch.name,
      status: booking.status,
    }));
  } catch (error: any) {
    // If booking table is not accessible, try to use Visit table as fallback
    if (error.message?.includes("denied access") || error.message?.includes("booking")) {
      console.warn("Booking table not accessible, using Visit table as fallback");
      try {
        const visits = await prisma.visit.findMany({
          where: { customerId },
          include: {
            branch: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        });

        return visits.map((visit) => ({
          id: visit.id,
          date: visit.date.toISOString(),
          serviceName: visit.service || null,
          stylistName: visit.stylist || null,
          branchName: visit.branch?.name || null,
          status: "COMPLETED" as const,
        }));
      } catch (visitError) {
        console.error("Error getting visit history:", visitError);
        return [];
      }
    }
    console.error("Error getting booking history:", error);
    return [];
  }
}

// ============================================
// 3. Get Invoice History
// ============================================

export async function getInvoiceHistory(
  customerId: string
): Promise<CustomerInvoiceHistory[]> {
  const invoices = await prisma.invoice.findMany({
    where: { customerId },
    include: {
      branch: {
        select: {
          name: true,
        },
      },
      items: {
        include: {
          service: {
            select: {
              name: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return invoices.map((invoice) => ({
    id: invoice.id,
    date: invoice.date.toISOString(),
    total: invoice.total,
    branchName: invoice.branch.name,
    items: invoice.items.map((item) => ({
      id: item.id,
      name: item.service?.name || item.product?.name || "Unknown",
      type: item.serviceId ? ("SERVICE" as const) : ("PRODUCT" as const),
      amount: item.amount,
    })),
  }));
}

// ============================================
// 4. Get Product History
// ============================================

export async function getProductHistory(
  customerId: string
): Promise<CustomerProductHistory[]> {
  const invoices = await prisma.invoice.findMany({
    where: {
      customerId,
      items: {
        some: {
          productId: {
            not: null,
          },
        },
      },
    },
    include: {
      items: {
        where: {
          productId: {
            not: null,
          },
        },
        include: {
          product: {
            select: {
              name: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const productHistory: CustomerProductHistory[] = [];

  for (const invoice of invoices) {
    for (const item of invoice.items) {
      if (item.product) {
        productHistory.push({
          id: item.id,
          name: item.product.name,
          category: item.product.category,
          purchasedAt: invoice.date.toISOString(),
          invoiceId: invoice.id,
        });
      }
    }
  }

  return productHistory;
}

// ============================================
// 5. Get Loyalty Info
// ============================================

export async function getLoyaltyInfo(
  customerId: string
): Promise<CustomerLoyaltyInfo> {
  const [customerLoyalty, loyaltyTiers] = await Promise.all([
    prisma.customerLoyalty.findUnique({
      where: { customerId },
      include: {
        tier: {
          select: {
            name: true,
            minSpend: true,
          },
        },
      },
    }),
    prisma.loyaltyTier.findMany({
      orderBy: {
        minSpend: "asc",
      },
    }),
  ]);

  if (!customerLoyalty) {
    return {
      totalPoints: 0,
      lifetimePoints: 0,
    };
  }

  // Calculate total spending from invoices (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentInvoices = await prisma.invoice.findMany({
    where: {
      customerId,
      date: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      total: true,
    },
  });

  const totalSpending = recentInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );

  // Find next tier
  const currentTier = customerLoyalty.tier;
  let nextTier = null;
  
  if (currentTier) {
    // Find the next tier with higher minSpend
    nextTier = loyaltyTiers.find(
      (tier) => tier.minSpend > currentTier.minSpend
    ) || null;
  } else {
    // If no current tier, find the first tier
    nextTier = loyaltyTiers[0] || null;
  }

  let progressPercent: number | undefined;
  if (nextTier && currentTier) {
    const currentSpend = totalSpending;
    const minSpend = currentTier.minSpend;
    const nextMinSpend = nextTier.minSpend;
    if (nextMinSpend > minSpend) {
      const progress = Math.min(
        100,
        ((currentSpend - minSpend) / (nextMinSpend - minSpend)) * 100
      );
      progressPercent = Math.max(0, progress);
    }
  } else if (nextTier && !currentTier) {
    // If no current tier, calculate progress to first tier
    const currentSpend = totalSpending;
    const nextMinSpend = nextTier.minSpend;
    if (nextMinSpend > 0) {
      const progress = Math.min(100, (currentSpend / nextMinSpend) * 100);
      progressPercent = Math.max(0, progress);
    }
  }

  return {
    tier: currentTier?.name.toString(),
    totalPoints: customerLoyalty.totalPoints,
    lifetimePoints: customerLoyalty.lifetimePoints,
    nextTier: nextTier?.name.toString(),
    progressPercent,
  };
}

// ============================================
// 6. Get Visit Frequency
// ============================================

export async function getVisitFrequency(
  customerId: string
): Promise<CustomerVisitFrequency> {
  try {
    const bookings = await prisma.booking.findMany({
      where: { customerId },
      select: {
        date: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const totalVisits = bookings.length;

    if (totalVisits === 0) {
      return {
        totalVisits: 0,
        avgVisitInterval: null,
        lastVisit: null,
        nextPredictedVisit: null,
      };
    }

    // Calculate average interval between visits
    let totalIntervalDays = 0;
    let intervalCount = 0;

    for (let i = 0; i < bookings.length - 1; i++) {
      const current = bookings[i].date;
      const next = bookings[i + 1].date;
      const interval = differenceInDays(current, next);
      totalIntervalDays += interval;
      intervalCount++;
    }

    const avgVisitInterval =
      intervalCount > 0 ? totalIntervalDays / intervalCount : null;

    const lastVisit = bookings[0]?.date.toISOString() ?? null;

    // Predict next visit: lastVisit + avgInterval
    let nextPredictedVisit: string | null = null;
    if (lastVisit && avgVisitInterval !== null) {
      const lastVisitDate = new Date(lastVisit);
      const predictedDate = addDays(lastVisitDate, Math.round(avgVisitInterval));
      nextPredictedVisit = predictedDate.toISOString();
    }

    return {
      totalVisits,
      avgVisitInterval,
      lastVisit,
      nextPredictedVisit,
    };
  } catch (error: any) {
    // Fallback to Visit table
    if (error.message?.includes("denied access") || error.message?.includes("booking")) {
      try {
        const visits = await prisma.visit.findMany({
          where: { customerId },
          select: {
            date: true,
          },
          orderBy: {
            date: "desc",
          },
        });

        const totalVisits = visits.length;
        if (totalVisits === 0) {
          return {
            totalVisits: 0,
            avgVisitInterval: null,
            lastVisit: null,
            nextPredictedVisit: null,
          };
        }

        let totalIntervalDays = 0;
        let intervalCount = 0;
        for (let i = 0; i < visits.length - 1; i++) {
          const current = visits[i].date;
          const next = visits[i + 1].date;
          const interval = differenceInDays(current, next);
          totalIntervalDays += interval;
          intervalCount++;
        }

        const avgVisitInterval = intervalCount > 0 ? totalIntervalDays / intervalCount : null;
        const lastVisit = visits[0]?.date.toISOString() ?? null;
        let nextPredictedVisit: string | null = null;
        if (lastVisit && avgVisitInterval !== null) {
          const lastVisitDate = new Date(lastVisit);
          const predictedDate = addDays(lastVisitDate, Math.round(avgVisitInterval));
          nextPredictedVisit = predictedDate.toISOString();
        }

        return {
          totalVisits,
          avgVisitInterval,
          lastVisit,
          nextPredictedVisit,
        };
      } catch (visitError) {
        console.error("Error getting visit frequency:", visitError);
        return {
          totalVisits: 0,
          avgVisitInterval: null,
          lastVisit: null,
          nextPredictedVisit: null,
        };
      }
    }
    console.error("Error getting visit frequency:", error);
    return {
      totalVisits: 0,
      avgVisitInterval: null,
      lastVisit: null,
      nextPredictedVisit: null,
    };
  }
}

// ============================================
// 7. Get Service Patterns
// ============================================

export async function getServicePatterns(
  customerId: string
): Promise<CustomerServicePattern[]> {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        customerId,
        serviceId: {
          not: null,
        },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Count frequency of each service
    const serviceCountMap = new Map<string, { id: string; name: string; count: number }>();

    for (const booking of bookings) {
      if (booking.service) {
        const serviceId = booking.service.id;
        const existing = serviceCountMap.get(serviceId);
        if (existing) {
          existing.count++;
        } else {
          serviceCountMap.set(serviceId, {
            id: serviceId,
            name: booking.service.name,
            count: 1,
          });
        }
      }
    }

    return Array.from(serviceCountMap.values()).map((item) => ({
      serviceId: item.id,
      serviceName: item.name,
      count: item.count,
    }));
  } catch (error: any) {
    // Fallback to Visit table
    if (error.message?.includes("denied access") || error.message?.includes("booking")) {
      try {
        const visits = await prisma.visit.findMany({
          where: { customerId },
          select: {
            service: true,
          },
        });

        const serviceCountMap = new Map<string, { id: string; name: string; count: number }>();
        visits.forEach((visit) => {
          if (visit.service) {
            const serviceName = visit.service;
            const existing = serviceCountMap.get(serviceName);
            if (existing) {
              existing.count++;
            } else {
              serviceCountMap.set(serviceName, {
                id: serviceName,
                name: serviceName,
                count: 1,
              });
            }
          }
        });

        return Array.from(serviceCountMap.values()).map((item) => ({
          serviceId: item.id,
          serviceName: item.name,
          count: item.count,
        }));
      } catch (visitError) {
        console.error("Error getting service patterns:", visitError);
        return [];
      }
    }
    console.error("Error getting service patterns:", error);
    return [];
  }
}

// ============================================
// 8. Get Branch Visit Map
// ============================================

export async function getBranchVisitMap(
  customerId: string
): Promise<Record<string, number>> {
  try {
    const bookings = await prisma.booking.findMany({
      where: { customerId },
      include: {
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

    const branchVisitMap: Record<string, number> = {};

    for (const booking of bookings) {
      const branchName = booking.branch.name;
      branchVisitMap[branchName] = (branchVisitMap[branchName] || 0) + 1;
    }

    return branchVisitMap;
  } catch (error: any) {
    // Fallback to Visit table
    if (error.message?.includes("denied access") || error.message?.includes("booking")) {
      try {
        const visits = await prisma.visit.findMany({
          where: { customerId },
          include: {
            branch: {
              select: {
                name: true,
              },
            },
          },
        });

        const branchVisitMap: Record<string, number> = {};
        for (const visit of visits) {
          const branchName = visit.branch?.name || "Unknown";
          branchVisitMap[branchName] = (branchVisitMap[branchName] || 0) + 1;
        }

        return branchVisitMap;
      } catch (visitError) {
        console.error("Error getting branch visit map:", visitError);
        return {};
      }
    }
    console.error("Error getting branch visit map:", error);
    return {};
  }
}

// ============================================
// 9. Get CRM Notes
// ============================================

export async function getCRMNotes(customerId: string): Promise<string[]> {
  // TODO: Implement in Phase 12
  // For now, return empty array
  return [];
}

// ============================================
// 10. Get Complaints
// ============================================

export async function getComplaints(customerId: string): Promise<string[]> {
  // TODO: Implement in Phase 13
  // For now, return empty array
  return [];
}

// ============================================
// Combine All Functions
// ============================================

export async function getCustomer360(customerId: string) {
  const [
    core,
    bookingHistory,
    invoiceHistory,
    productHistory,
    loyalty,
    visitFrequency,
    servicePatterns,
    branchVisits,
    crmNotes,
    complaints,
  ] = await Promise.all([
    getCustomerCore(customerId),
    getBookingHistory(customerId),
    getInvoiceHistory(customerId),
    getProductHistory(customerId),
    getLoyaltyInfo(customerId),
    getVisitFrequency(customerId),
    getServicePatterns(customerId),
    getBranchVisitMap(customerId),
    getCRMNotes(customerId),
    getComplaints(customerId),
  ]);

  return {
    core,
    bookingHistory,
    invoiceHistory,
    productHistory,
    loyalty,
    visitFrequency,
    servicePatterns,
    branchVisits,
    crmNotes,
    complaints,
  };
}

