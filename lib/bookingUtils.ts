import { prisma } from "@/lib/prisma";

const DEFAULT_BUFFER_TIME_MINUTES = 10;

export interface BookingConflict {
  bookingId: string;
  startTime: Date;
  endTime: Date;
  customerName?: string;
}

/**
 * Check if a booking time conflicts with existing bookings for the same staff
 * @param staffId - Staff ID to check conflicts for
 * @param startDateTime - Start date and time of the new booking
 * @param endDateTime - End date and time of the new booking
 * @param bufferMinutes - Buffer time in minutes (default: 10)
 * @param excludeBookingId - Booking ID to exclude from conflict check (for updates)
 * @param salonId - Salon ID for multi-tenant isolation (required)
 * @returns Array of conflicting bookings or null if no conflicts
 */
export async function checkBookingConflicts(
  staffId: string | null,
  startDateTime: Date,
  endDateTime: Date,
  bufferMinutes: number = DEFAULT_BUFFER_TIME_MINUTES,
  excludeBookingId?: string,
  salonId?: string
): Promise<BookingConflict[] | null> {
  if (!staffId) {
    // If no staff assigned, no conflicts
    return null;
  }

  // Calculate time range with buffer
  const bufferMs = bufferMinutes * 60 * 1000;
  const checkStart = new Date(startDateTime.getTime() - bufferMs);
  const checkEnd = new Date(endDateTime.getTime() + bufferMs);

  // Find existing bookings for the same staff that overlap
  const existingBookings = await prisma.booking.findMany({
    where: {
      stylistId: staffId,
      ...(salonId && { salonId }), // Multi-tenant: Filter by salonId
      date: {
        gte: checkStart,
        lte: checkEnd,
      },
      status: {
        notIn: ["CANCELLED", "NO_SHOW"], // Exclude cancelled bookings
      },
      ...(excludeBookingId && {
        id: {
          not: excludeBookingId,
        },
      }),
    },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
          name: true,
        },
      },
      service: {
        select: {
          duration: true,
        },
      },
    },
  });

  // Check for actual overlaps (considering buffer)
  const conflicts: BookingConflict[] = [];

  for (const booking of existingBookings) {
    const bookingStart = new Date(booking.date);
    // Get duration from service or use default
    const bookingDuration = booking.service?.duration || 60; // Default 60 minutes
    const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60 * 1000);

    // Check if times overlap (with buffer)
    if (
      (startDateTime.getTime() < bookingEnd.getTime() + bufferMs) &&
      (endDateTime.getTime() > bookingStart.getTime() - bufferMs)
    ) {
      const customerName = booking.customer?.name || 
        (booking.customer?.firstName && booking.customer?.lastName
          ? `${booking.customer.firstName} ${booking.customer.lastName}`
          : undefined);

      conflicts.push({
        bookingId: booking.id,
        startTime: bookingStart,
        endTime: bookingEnd,
        customerName,
      });
    }
  }

  return conflicts.length > 0 ? conflicts : null;
}

