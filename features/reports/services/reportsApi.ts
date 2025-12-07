// ============================================
// Reports API Service
// ============================================

import {
  RevenueSummary,
  ServiceReport,
  StaffReport,
  BookingBehavior,
  DateRange,
} from "../types";

const API_BASE = "/api/reports";

/**
 * GET /api/reports/summary
 */
export async function getRevenueSummary(
  dateRange: DateRange
): Promise<RevenueSummary> {
  try {
    const response = await fetch(
      `${API_BASE}/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch revenue summary");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching revenue summary:", error);
    throw error;
  }
}

/**
 * GET /api/reports/services
 */
export async function getServiceReport(
  dateRange: DateRange
): Promise<ServiceReport[]> {
  try {
    const response = await fetch(
      `${API_BASE}/services?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch service report");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching service report:", error);
    throw error;
  }
}

/**
 * GET /api/reports/staff
 */
export async function getStaffReport(dateRange: DateRange): Promise<StaffReport[]> {
  try {
    const response = await fetch(
      `${API_BASE}/staff?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch staff report");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching staff report:", error);
    throw error;
  }
}

/**
 * GET /api/reports/behavior
 */
export async function getBookingBehavior(
  dateRange: DateRange
): Promise<BookingBehavior> {
  try {
    const response = await fetch(
      `${API_BASE}/behavior?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch booking behavior");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching booking behavior:", error);
    throw error;
  }
}

