// ============================================
// Attendance Service - Check-in/out
// ============================================

import { prisma } from "@/lib/prisma";
// AttendanceStatus enum: PRESENT, LATE, ABSENT
import { format, startOfDay, isAfter, differenceInMinutes } from "date-fns";

/**
 * Check in a staff member
 */
export async function checkIn(
  staffId: string,
  location?: { lat: number; lng: number }
): Promise<void> {
  const today = startOfDay(new Date());
  const now = new Date();

  // Check if already checked in today
  const existing = await prisma.staffDailyRecord.findFirst({
    where: {
      staffId,
      date: today,
    },
  });

  if (existing && existing.checkIn) {
    throw new Error("Already checked in today");
  }

  // Determine status (late if after 8:00 AM)
  const expectedCheckIn = new Date(today);
  expectedCheckIn.setHours(8, 0, 0, 0);

  let status: "PRESENT" | "LATE" | "ABSENT" = "PRESENT";
  if (isAfter(now, expectedCheckIn)) {
    const minutesLate = differenceInMinutes(now, expectedCheckIn);
    // Consider late if more than 15 minutes
    if (minutesLate > 15) {
      status = "LATE";
    }
  }

  // Upsert daily record
  if (existing) {
    await prisma.staffDailyRecord.update({
      where: { id: existing.id },
      data: {
        checkIn: now,
        status,
        location: location ? (location as any) : undefined,
      },
    });
  } else {
    await prisma.staffDailyRecord.create({
      data: {
        staffId,
        date: today,
        checkIn: now,
        status,
        location: location ? (location as any) : undefined,
      },
    });
  }
}

/**
 * Check out a staff member
 */
export async function checkOut(
  staffId: string,
  notes?: string
): Promise<void> {
  const today = startOfDay(new Date());
  const now = new Date();

  // Get today's record
  const record = await prisma.staffDailyRecord.findFirst({
    where: {
      staffId,
      date: today,
    },
  });

  if (!record) {
    throw new Error("No check-in record found. Please check in first.");
  }

  if (record.checkOut) {
    throw new Error("Already checked out today");
  }

  // Update record (need to find by ID first)
  const recordToUpdate = await prisma.staffDailyRecord.findFirst({
    where: {
      staffId,
      date: today,
    },
  });

  if (!recordToUpdate) {
    throw new Error("Record not found");
  }

  await prisma.staffDailyRecord.update({
    where: {
      id: recordToUpdate.id,
    },
    data: {
      checkOut: now,
      notes: notes || record.notes,
    },
  });
}

/**
 * Mark staff as absent
 */
export async function markAbsent(
  staffId: string,
  date: Date,
  notes?: string
): Promise<void> {
  const dayStart = startOfDay(date);

  const existing = await prisma.staffDailyRecord.findFirst({
    where: {
      staffId,
      date: dayStart,
    },
  });

  if (existing) {
    await prisma.staffDailyRecord.update({
      where: { id: existing.id },
      data: {
        status: "ABSENT",
        notes,
      },
    });
  } else {
    await prisma.staffDailyRecord.create({
      data: {
        staffId,
        date: dayStart,
        status: "ABSENT",
        notes,
      },
    });
  }
}

/**
 * Get attendance summary for a month
 */
export async function getAttendanceSummary(
  staffId: string,
  month: string // YYYY-MM
): Promise<{
  presentDays: number;
  lateDays: number;
  absentDays: number;
  leaveDays: number;
  attendanceRate: number;
}> {
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = startOfDay(new Date(year, monthNum - 1, 1));
  const endDate = startOfDay(new Date(year, monthNum, 0));

  const records = await prisma.staffDailyRecord.findMany({
    where: {
      staffId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const presentDays = records.filter((r) => r.status === "PRESENT").length;
  const lateDays = records.filter((r) => r.status === "LATE").length;
  const absentDays = records.filter((r) => r.status === "ABSENT").length;
  const leaveDays = 0; // Not in enum
  const totalDays = records.length;

  const attendanceRate =
    totalDays > 0
      ? ((presentDays + lateDays) / totalDays) * 100
      : 0;

  return {
    presentDays,
    lateDays,
    absentDays,
    leaveDays,
    attendanceRate,
  };
}

