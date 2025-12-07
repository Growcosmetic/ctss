// ============================================
// Staff API Service
// ============================================

import {
  StaffBooking,
  ServiceChecklist,
  CustomerQuickInfo,
} from "../types";

const API_BASE = "/api/staff";

/**
 * GET /api/staff/today-bookings
 */
export async function getStaffTodayBookings(): Promise<StaffBooking[]> {
  try {
    const response = await fetch(`${API_BASE}/today-bookings`);
    if (!response.ok) {
      throw new Error("Failed to get today bookings");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting today bookings:", error);
    throw error;
  }
}

/**
 * GET /api/staff/checklist?bookingId=xxx
 */
export async function getServiceChecklist(
  bookingId: string
): Promise<ServiceChecklist | null> {
  try {
    const response = await fetch(`${API_BASE}/checklist?bookingId=${bookingId}`);
    if (!response.ok) {
      throw new Error("Failed to get checklist");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting checklist:", error);
    throw error;
  }
}

/**
 * POST /api/staff/checklist
 */
export async function saveServiceChecklist(
  checklist: ServiceChecklist
): Promise<ServiceChecklist> {
  try {
    const response = await fetch(`${API_BASE}/checklist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checklist),
    });

    if (!response.ok) {
      throw new Error("Failed to save checklist");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error saving checklist:", error);
    throw error;
  }
}

/**
 * POST /api/staff/booking-status
 */
export async function markServiceStatus(
  bookingId: string,
  status: "UPCOMING" | "IN_SERVICE" | "COMPLETED"
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/booking-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId, status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update booking status");
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
}

/**
 * GET /api/staff/customer-quick-info?customerId=xxx
 */
export async function getCustomerQuickInfo(
  customerId: string
): Promise<CustomerQuickInfo> {
  try {
    const response = await fetch(
      `${API_BASE}/customer-quick-info?customerId=${customerId}`
    );
    if (!response.ok) {
      throw new Error("Failed to get customer quick info");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting customer quick info:", error);
    throw error;
  }
}

