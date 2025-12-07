/**
 * Utility functions for booking operations
 */

/**
 * Get time from grid row index
 * Each row represents 30 minutes, starting from 08:00
 * @param rowIndex - Index of the row (0-based)
 * @returns Time string in HH:mm format
 */
export function getTimeFromRowIndex(rowIndex: number): string {
  const hour = 8 + Math.floor(rowIndex / 2); // timeline bắt đầu 08:00
  const minute = rowIndex % 2 === 0 ? 0 : 30;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

/**
 * Add duration to start time
 * @param start - Start time in HH:mm format (e.g., "09:00")
 * @param duration - Duration in minutes (e.g., 60)
 * @returns End time in HH:mm format (e.g., "10:00")
 */
export function addDuration(start: string, duration: number): string {
  const [hour, minute] = start.split(":").map(Number);
  const startTotalMinutes = hour * 60 + minute;
  const endTotalMinutes = startTotalMinutes + duration;
  const endHour = Math.floor(endTotalMinutes / 60);
  const endMinute = endTotalMinutes % 60;
  return `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
}

/**
 * Get row index from time
 * @param time - Time string in HH:mm format
 * @returns Row index (0-based)
 */
export function getRowIndexFromTime(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = (hour - 8) * 60 + minute; // 08:00 = 0
  return Math.floor(totalMinutes / 30); // Each row is 30 minutes
}

/**
 * Check if a time is within valid timeline (08:00 - 21:00)
 */
export function isValidTime(time: string): boolean {
  const [hour, minute] = time.split(":").map(Number);
  return hour >= 8 && hour <= 21 && !(hour === 21 && minute > 0);
}

/**
 * Check if end time is within valid timeline
 */
export function isValidEndTime(endTime: string): boolean {
  const [hour, minute] = endTime.split(":").map(Number);
  return hour <= 21 && !(hour === 21 && minute > 0);
}

/**
 * Convert time string to total minutes from 00:00
 */
export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

/**
 * Convert minutes to time string (HH:mm)
 */
export function minutesToTime(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

/**
 * Check if two bookings overlap
 * @param booking1 - First booking
 * @param booking2 - Second booking
 * @returns true if bookings overlap
 */
export function bookingsOverlap(
  booking1: { start: string; end: string },
  booking2: { start: string; end: string }
): boolean {
  const start1 = timeToMinutes(booking1.start);
  const end1 = timeToMinutes(booking1.end);
  const start2 = timeToMinutes(booking2.start);
  const end2 = timeToMinutes(booking2.end);

  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  );
}
