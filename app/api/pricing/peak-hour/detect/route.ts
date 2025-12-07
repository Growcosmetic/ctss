// ============================================
// PHASE 33D - Peak Hour & Traffic Detection
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/pricing/peak-hour/detect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      timeSlot, // e.g., "14:00-15:00"
      branchId,
    } = body;

    const targetDate = date ? new Date(date) : new Date();
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const [startTime, endTime] = timeSlot ? timeSlot.split('-') : [null, null];

    // Get bookings in this time slot
    const bookings = await prisma.booking.findMany({
      where: {
        branchId: branchId || undefined,
        date: {
          gte: new Date(`${targetDateStr}T${startTime || '00:00'}:00`),
          lt: new Date(`${targetDateStr}T${endTime || '23:59'}:59`),
        },
      },
    });

    const bookingCount = bookings.length;

    // Get waiting customers (bookings with status WAITING)
    const waitingCustomers = bookings.filter(b => b.status === "WAITING").length;

    // Get branch capacity
    const branch = branchId
      ? await prisma.branch.findUnique({
          where: { id: branchId },
        })
      : null;

    // Estimate available seats (would need actual capacity data)
    const totalSeats = 8; // Default
    const availableSeats = Math.max(0, totalSeats - bookingCount);

    // Get available stylists
    const allStaff = await prisma.user.findMany({
      where: {
        branchId: branchId || undefined,
        role: "STYLIST",
      },
    });

    const totalStylists = allStaff.length;
    const busyStylists = new Set(bookings.map(b => b.staffId).filter(Boolean)).size;
    const availableStylists = Math.max(0, totalStylists - busyStylists);

    // Get online inquiries (would need to query inquiries/chats)
    const onlineInquiries = 0; // Placeholder
    const pageViews = 0; // Placeholder

    // Calculate peak score (0-100)
    let peakScore = 0;

    // Booking density
    const bookingDensity = (bookingCount / totalSeats) * 100;
    peakScore += bookingDensity * 0.4;

    // Stylist utilization
    const stylistUtilization = totalStylists > 0 ? (busyStylists / totalStylists) * 100 : 0;
    peakScore += stylistUtilization * 0.3;

    // Waiting customers
    peakScore += Math.min(waitingCustomers * 10, 20) * 0.2;

    // Online activity (if available)
    peakScore += Math.min(onlineInquiries * 2, 10) * 0.1;

    peakScore = Math.min(peakScore, 100);

    // Determine traffic level
    let trafficLevel = "LOW";
    if (peakScore >= 80) trafficLevel = "VERY_HIGH";
    else if (peakScore >= 60) trafficLevel = "HIGH";
    else if (peakScore >= 40) trafficLevel = "NORMAL";
    else trafficLevel = "LOW";

    // Get service IDs being requested
    const serviceIds = [...new Set(bookings.map(b => b.serviceId).filter(Boolean))];

    // Create peak hour detection record
    const detection = await prisma.peakHourDetection.create({
      data: {
        date: targetDate,
        timeSlot: timeSlot || `${targetDate.getHours()}:00-${targetDate.getHours() + 1}:00`,
        dayOfWeek: targetDate.getDay(),
        bookingCount,
        waitingCustomers,
        availableSeats,
        availableStylists,
        totalStylists,
        onlineInquiries,
        pageViews,
        trafficLevel,
        peakScore,
        branchId: branchId || null,
        serviceIds,
      },
    });

    return successResponse(detection);
  } catch (error: any) {
    console.error("Error detecting peak hour:", error);
    return errorResponse(error.message || "Failed to detect peak hour", 500);
  }
}

// GET /api/pricing/peak-hour
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const branchId = searchParams.get("branchId");

    const where: any = {};
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: targetDate, lt: nextDay };
    }
    if (branchId) where.branchId = branchId;

    const detections = await prisma.peakHourDetection.findMany({
      where,
      orderBy: { timeSlot: "asc" },
    });

    return successResponse(detections);
  } catch (error: any) {
    console.error("Error fetching peak hour data:", error);
    return errorResponse(error.message || "Failed to fetch peak hour data", 500);
  }
}

