import { prisma } from "@/lib/prisma";
import { callOpenAIJSON } from "./openai";

export interface BookingPrediction {
  customerId: string;
  predictedNextVisit: string; // ISO date
  confidence: number;
  recommendedServices: Array<{
    serviceId: string;
    serviceName: string;
    reason: string;
  }>;
  bestTimeSlots: Array<{
    dayOfWeek: string;
    timeRange: string;
    reason: string;
  }>;
  reasoning: string;
}

/**
 * Get AI-powered booking prediction for a customer
 */
export async function getBookingPrediction(
  customerId: string
): Promise<BookingPrediction | null> {
  try {
    // Fetch customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        bookings: {
          orderBy: { bookingDate: "desc" },
          include: {
            bookingServices: {
              include: {
                service: true,
              },
            },
          },
        },
        posOrders: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Analyze booking patterns
    const bookingIntervals: number[] = [];
    const preferredDays: Record<string, number> = {};
    const preferredTimes: Record<string, number> = {};
    const servicePreferences: Record<string, number> = {};

    for (let i = 0; i < customer.bookings.length - 1; i++) {
      const current = new Date(customer.bookings[i].bookingDate);
      const next = new Date(customer.bookings[i + 1].bookingDate);
      const daysDiff = Math.floor(
        (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
      );
      bookingIntervals.push(daysDiff);

      const dayOfWeek = current.toLocaleDateString("vi-VN", { weekday: "long" });
      preferredDays[dayOfWeek] = (preferredDays[dayOfWeek] || 0) + 1;

      const bookingTime = new Date(customer.bookings[i].bookingTime);
      const hour = bookingTime.getHours();
      const timeSlot = `${hour}:00-${hour + 1}:00`;
      preferredTimes[timeSlot] = (preferredTimes[timeSlot] || 0) + 1;
    }

    customer.bookings.forEach((booking) => {
      booking.bookingServices.forEach((bs) => {
        servicePreferences[bs.service.name] =
          (servicePreferences[bs.service.name] || 0) + 1;
      });
    });

    const avgInterval =
      bookingIntervals.length > 0
        ? bookingIntervals.reduce((a, b) => a + b, 0) / bookingIntervals.length
        : 21; // Default 3 weeks

    // Get available services
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        servicePrices: {
          where: { isActive: true },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
        },
      },
    });

    // Build prompt for OpenAI
    const prompt = `
Predict when this customer will book their next appointment and what services they might want.

Customer Information:
- Name: ${customer.firstName} ${customer.lastName}
- Total Visits: ${customer.totalVisits}
- Last Visit: ${customer.lastVisitDate || "Never"}
- Total Spent: ${customer.totalSpent}₫

Booking History:
- Total Bookings: ${customer.bookings.length}
- Average Interval: ${avgInterval.toFixed(1)} days
- Preferred Days: ${JSON.stringify(preferredDays)}
- Preferred Times: ${JSON.stringify(preferredTimes)}
- Service Preferences: ${JSON.stringify(servicePreferences)}

Available Services:
${services.map((s) => `- ${s.name} (${s.duration} min, ${s.servicePrices[0]?.price || 0}₫)`).join("\n")}

Predict:
1. When they will book next (date prediction)
2. Recommended services based on their history
3. Best time slots for booking
4. Confidence level

Return JSON with:
- customerId: "${customerId}"
- predictedNextVisit: ISO date string
- confidence: 0-100
- recommendedServices: array of {serviceId, serviceName, reason}
- bestTimeSlots: array of {dayOfWeek, timeRange, reason}
- reasoning: explanation
`;

    const systemPrompt = `You are an expert customer behavior analyst for a beauty salon.
Analyze booking patterns to predict future appointments and recommend services.
Always respond with valid JSON format.`;

    const response = await callOpenAIJSON<BookingPrediction>(
      prompt,
      systemPrompt
    );

    if (response.success && response.data) {
      return response.data;
    }

    // Fallback prediction
    return generateFallbackPrediction(customer, services, avgInterval);
  } catch (error: any) {
    console.error("Error getting booking prediction:", error);
    return null;
  }
}

function generateFallbackPrediction(
  customer: any,
  services: any[],
  avgInterval: number
): BookingPrediction {
  const lastVisit = customer.lastVisitDate
    ? new Date(customer.lastVisitDate)
    : new Date();
  const predictedDate = new Date(lastVisit);
  predictedDate.setDate(predictedDate.getDate() + Math.round(avgInterval));

  return {
    customerId: customer.id,
    predictedNextVisit: predictedDate.toISOString().split("T")[0],
    confidence: 70,
    recommendedServices: services.slice(0, 3).map((s) => ({
      serviceId: s.id,
      serviceName: s.name,
      reason: "Dựa trên lịch sử đặt lịch của khách hàng",
    })),
    bestTimeSlots: [
      {
        dayOfWeek: "Thứ 2",
        timeRange: "09:00-12:00",
        reason: "Thời gian phù hợp dựa trên lịch sử",
      },
    ],
    reasoning: `Khách hàng thường quay lại sau ${Math.round(avgInterval)} ngày.`,
  };
}

