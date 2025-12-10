// ============================================
// MINA Data Engine - Analytics + Recommendations
// ============================================

import { prisma } from "@/lib/prisma";
import {
  CustomerSummary,
  ReturnPrediction,
  ServiceSuggestion,
  ChurnRisk,
  POSUpsellSuggestion,
  InvoiceDraft,
} from "../types";

/**
 * Generate customer summary with analytics
 */
export async function generateCustomerSummary(
  customerId: string
): Promise<CustomerSummary> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      invoices: {
        where: { status: "PAID" },
        include: {
          invoiceItems: {
            include: {
              service: {
                select: { id: true, name: true },
              },
            },
          },
          booking: {
            include: {
              staff: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      bookings: {
        where: { status: "NO_SHOW" },
        take: 5,
      },
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Get last 3 visits
  const recentVisits = customer.invoices.slice(0, 3).map((inv) => {
    const mainService = inv.invoiceItems.find((item) => item.service)?.service?.name || "N/A";
    return {
      date: inv.createdAt.toISOString().split("T")[0],
      serviceName: mainService,
      amount: Number(inv.total),
    };
  });

  // Calculate spending pattern
  const amounts = customer.invoices.map((inv) => Number(inv.total));
  const averageSpending = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;

  let trend: "increasing" | "decreasing" | "stable" = "stable";
  if (amounts.length >= 3) {
    const recent = amounts.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const older = amounts.slice(3, 6).reduce((a, b) => a + b, 0) / Math.min(3, amounts.length - 3);
    if (recent > older * 1.1) trend = "increasing";
    else if (recent < older * 0.9) trend = "decreasing";
  }

  // Find stylist preference
  const staffCounts = new Map<string, { staffId: string; staffName: string; count: number }>();
  customer.invoices.forEach((inv) => {
    if (inv.booking?.staff) {
      const staffId = inv.booking.staff.id;
      const staffName = `${inv.booking.staff.user.firstName} ${inv.booking.staff.user.lastName}`;
      const existing = staffCounts.get(staffId);
      if (existing) {
        existing.count++;
      } else {
        staffCounts.set(staffId, { staffId, staffName, count: 1 });
      }
    }
  });

  const stylistPreference =
    staffCounts.size > 0
      ? Array.from(staffCounts.values()).sort((a, b) => b.count - a.count)[0]
      : null;

  // Warning flags
  const warningFlags: string[] = [];
  if (customer.bookings.length > 0) {
    warningFlags.push("Có lịch hẹn không đến (no-show)");
  }
  if (customer.riskLevel === "HIGH") {
    warningFlags.push("Khách hàng có rủi ro cao");
  }
  if (customer.lastVisitDate) {
    const daysSinceLastVisit = Math.floor(
      (Date.now() - new Date(customer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastVisit > 180) {
      warningFlags.push("Không đến hơn 6 tháng");
    }
  }

  return {
    customerId: customer.id,
    basicInfo: {
      name: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone,
      totalVisits: customer.totalVisits,
      totalSpent: Number(customer.totalSpent),
      lastVisitDate: customer.lastVisitDate?.toISOString().split("T")[0] || null,
    },
    recentVisits,
    spendingPattern: {
      averageSpending,
      trend,
    },
    preferences: customer.preferences || {},
    stylistPreference,
    warningFlags,
  };
}

/**
 * Predict when customer should return
 */
export async function predictReturnDate(customerId: string): Promise<ReturnPrediction> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      invoices: {
        where: { status: "PAID" },
        include: {
          invoiceItems: {
            include: {
              service: {
                select: { id: true, name: true, duration: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (customer.invoices.length < 2) {
    // Not enough data, use default based on last service
    const lastService = customer.invoices[0]?.invoiceItems.find((item) => item.service)?.service;
    let defaultDays = 30; // Default 1 month

    if (lastService) {
      const serviceName = lastService.name.toLowerCase();
      if (serviceName.includes("uốn") || serviceName.includes("duỗi")) {
        defaultDays = 90; // 3 months
      } else if (serviceName.includes("nhuộm")) {
        defaultDays = 60; // 2 months
      } else if (serviceName.includes("phục hồi")) {
        defaultDays = 45; // 1.5 months
      }
    }

    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + defaultDays);

    return {
      customerId,
      predictedDate: predictedDate.toISOString().split("T")[0],
      confidenceScore: 0.3,
      reasoning: "Chưa đủ dữ liệu lịch sử, dự đoán dựa trên loại dịch vụ cuối cùng",
    };
  }

  // Calculate intervals between visits
  const visitDates = customer.invoices
    .map((inv) => new Date(inv.createdAt))
    .sort((a, b) => b.getTime() - a.getTime());

  const intervals: number[] = [];
  for (let i = 0; i < visitDates.length - 1; i++) {
    const diff = visitDates[i].getTime() - visitDates[i + 1].getTime();
    intervals.push(Math.floor(diff / (1000 * 60 * 60 * 24))); // days
  }

  // Check if intervals are stable (within 20% variance)
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  const isStable = stdDev / avgInterval < 0.2;

  let predictedDate: Date;
  let confidenceScore: number;
  let reasoning: string;

  if (isStable && intervals.length >= 2) {
    // Use average interval
    predictedDate = new Date(visitDates[0]);
    predictedDate.setDate(predictedDate.getDate() + Math.round(avgInterval));
    confidenceScore = Math.min(0.9, 0.5 + intervals.length * 0.1);
    reasoning = `Dựa trên chu kỳ ổn định: trung bình ${Math.round(avgInterval)} ngày giữa các lần đến`;
  } else {
    // Use service-type rules
    const lastService = customer.invoices[0]?.invoiceItems.find((item) => item.service)?.service;
    let defaultDays = 30;

    if (lastService) {
      const serviceName = lastService.name.toLowerCase();
      if (serviceName.includes("uốn") || serviceName.includes("duỗi")) {
        defaultDays = 90;
      } else if (serviceName.includes("nhuộm")) {
        defaultDays = 60;
      } else if (serviceName.includes("phục hồi")) {
        defaultDays = 45;
      }
    }

    predictedDate = new Date(visitDates[0]);
    predictedDate.setDate(predictedDate.getDate() + defaultDays);
    confidenceScore = 0.5;
    reasoning = `Chu kỳ không ổn định, dự đoán dựa trên loại dịch vụ: ${lastService?.name || "N/A"}`;
  }

  return {
    customerId,
    predictedDate: predictedDate.toISOString().split("T")[0],
    confidenceScore,
    reasoning,
  };
}

/**
 * Suggest services based on customer history
 */
export async function suggestServices(customerId: string): Promise<ServiceSuggestion[]> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      invoices: {
        where: { status: "PAID" },
        include: {
          invoiceItems: {
            include: {
              service: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const suggestions: ServiceSuggestion[] = [];

  // Get all services used by customer
  const usedServices = new Set<string>();
  customer.invoices.forEach((inv) => {
    inv.invoiceItems.forEach((item) => {
      if (item.service) {
        usedServices.add(item.service.id);
      }
    });
  });

  // Get all available services
  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  // Service relationship rules
  const serviceRelations: Record<string, string[]> = {
    uốn: ["phục hồi", "dưỡng tóc", "sản phẩm tại nhà"],
    duỗi: ["phục hồi", "dưỡng tóc"],
    nhuộm: ["phục hồi", "dưỡng tóc", "bảo vệ màu"],
    "phục hồi": ["dưỡng tóc", "sản phẩm tại nhà"],
    "cắt tóc": ["gội đầu", "massage đầu"],
  };

  // Find last service
  const lastService = customer.invoices[0]?.invoiceItems.find((item) => item.service)?.service;
  if (lastService) {
    const lastServiceName = lastService.name.toLowerCase();
    for (const [key, related] of Object.entries(serviceRelations)) {
      if (lastServiceName.includes(key)) {
        related.forEach((relatedName) => {
          const matchingService = allServices.find((s) =>
            s.name.toLowerCase().includes(relatedName.toLowerCase())
          );
          if (matchingService && !usedServices.has(matchingService.id)) {
            suggestions.push({
              serviceId: matchingService.id,
              serviceName: matchingService.name,
              reason: `Sau khi ${lastService.name}, nên ${relatedName}`,
              priority: "high",
            });
          }
        });
      }
    }
  }

  // Check for maintenance services (if customer repeats a service type)
  const serviceCounts = new Map<string, number>();
  customer.invoices.forEach((inv) => {
    inv.invoiceItems.forEach((item) => {
      if (item.service) {
        const count = serviceCounts.get(item.service.id) || 0;
        serviceCounts.set(item.service.id, count + 1);
      }
    });
  });

  // If customer uses a service 3+ times, suggest maintenance
  serviceCounts.forEach((count, serviceId) => {
    if (count >= 3) {
      const service = allServices.find((s) => s.id === serviceId);
      if (service) {
        const serviceName = service.name.toLowerCase();
        if (serviceName.includes("uốn") || serviceName.includes("duỗi")) {
          const maintenanceService = allServices.find((s) =>
            s.name.toLowerCase().includes("phục hồi")
          );
          if (maintenanceService && !suggestions.find((s) => s.serviceId === maintenanceService.id)) {
            suggestions.push({
              serviceId: maintenanceService.id,
              serviceName: maintenanceService.name,
              reason: `Khách thường xuyên ${service.name}, nên phục hồi tóc định kỳ`,
              priority: "medium",
            });
          }
        }
      }
    }
  });

  return suggestions.slice(0, 5); // Return top 5
}

/**
 * Detect churn risk for customer
 */
export async function detectChurnRisk(customerId: string): Promise<ChurnRisk> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      invoices: {
        where: { status: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      bookings: {
        where: { status: "NO_SHOW" },
        take: 5,
      },
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const reasons: string[] = [];
  let riskScore = 0;

  // Check predicted return date vs actual
  const prediction = await predictReturnDate(customerId);
  if (customer.lastVisitDate) {
    const lastVisit = new Date(customer.lastVisitDate);
    const predicted = new Date(prediction.predictedDate);
    const daysOverdue = Math.floor((Date.now() - predicted.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue > 0) {
      const overdueRatio = daysOverdue / Math.max(30, (predicted.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
      if (overdueRatio > 1.5) {
        reasons.push(`Quá hạn quay lại ${Math.round(daysOverdue)} ngày`);
        riskScore += 0.4;
      } else if (overdueRatio > 0.5) {
        reasons.push(`Sắp quá hạn quay lại`);
        riskScore += 0.2;
      }
    }
  }

  // Check for no-shows
  if (customer.bookings.length > 0) {
    reasons.push(`Có ${customer.bookings.length} lịch hẹn không đến gần đây`);
    riskScore += 0.3;
  }

  // Check if customer has high risk level
  if (customer.riskLevel === "HIGH") {
    reasons.push(`Mức độ rủi ro: ${customer.riskLevel}`);
    riskScore += 0.5;
  }

  // Check last visit date
  if (customer.lastVisitDate) {
    const daysSinceLastVisit = Math.floor(
      (Date.now() - new Date(customer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastVisit > 180) {
      reasons.push(`Không đến hơn 6 tháng`);
      riskScore += 0.4;
    } else if (daysSinceLastVisit > 90) {
      reasons.push(`Không đến hơn 3 tháng`);
      riskScore += 0.2;
    }
  }

  // Determine risk level
  let riskLevel: "LOW" | "MEDIUM" | "HIGH";
  if (riskScore >= 0.7) {
    riskLevel = "HIGH";
  } else if (riskScore >= 0.4) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  return {
    customerId,
    riskLevel,
    score: Math.min(1, riskScore),
    reasons: reasons.length > 0 ? reasons : ["Không có dấu hiệu rủi ro"],
  };
}

/**
 * Get POS upsell suggestions based on invoice draft
 */
export async function getPOSUpsellSuggestions(
  invoiceDraft: InvoiceDraft
): Promise<POSUpsellSuggestion[]> {
  const suggestions: POSUpsellSuggestion[] = [];

  // Get service names from draft
  const serviceNames = invoiceDraft.items
    .filter((item) => item.serviceId)
    .map((item) => item.name.toLowerCase());

  // Service combination rules
  const combinationRules: Record<string, string[]> = {
    uốn: ["phục hồi", "dưỡng tóc", "sản phẩm chăm sóc tại nhà"],
    duỗi: ["phục hồi", "dưỡng tóc"],
    nhuộm: ["phục hồi", "bảo vệ màu", "dưỡng tóc"],
    "phục hồi": ["dưỡng tóc", "sản phẩm tại nhà"],
    "cắt tóc": ["gội đầu", "massage đầu"],
  };

  // Check each service in draft
  for (const serviceName of serviceNames) {
    for (const [key, related] of Object.entries(combinationRules)) {
      if (serviceName.includes(key)) {
        for (const relatedName of related) {
          // Check if already in draft
          const alreadyAdded = invoiceDraft.items.some((item) =>
            item.name.toLowerCase().includes(relatedName.toLowerCase())
          );

          if (!alreadyAdded) {
            // Try to find matching service or product
            const service = await prisma.service.findFirst({
              where: {
                name: { contains: relatedName, mode: "insensitive" as any },
                isActive: true,
              },
              select: { id: true, name: true },
            });

            if (service) {
              suggestions.push({
                serviceId: service.id,
                name: service.name,
                reason: `Thường đi kèm với ${serviceName}`,
                priority: "high",
              });
            } else {
              // Try product
              const product = await prisma.product.findFirst({
                where: {
                  name: { contains: relatedName, mode: "insensitive" as any },
                  isActive: true,
                },
                select: { id: true, name: true },
              });

              if (product) {
                suggestions.push({
                  productId: product.id,
                  name: product.name,
                  reason: `Sản phẩm chăm sóc sau ${serviceName}`,
                  priority: "medium",
                });
              }
            }
          }
        }
      }
    }
  }

  // Remove duplicates
  const uniqueSuggestions = suggestions.filter(
    (suggestion, index, self) =>
      index === self.findIndex((s) => (s.serviceId || s.productId) === (suggestion.serviceId || suggestion.productId))
  );

  return uniqueSuggestions.slice(0, 5); // Return top 5
}

