// ============================================
// Customer App API Service
// ============================================

import {
  CustomerBooking,
  CustomerLoyaltyInfo,
  Promotion,
  MinaRecommendation,
  CustomerNotification,
} from "../types";

/**
 * GET /api/customer/bookings
 */
export async function getCustomerBookings(
  status?: "upcoming" | "history"
): Promise<CustomerBooking[]> {
  try {
    const params = status ? `?status=${status}` : "";
    const response = await fetch(`/api/customer/bookings${params}`);
    if (!response.ok) {
      throw new Error("Failed to get bookings");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting bookings:", error);
    throw error;
  }
}

/**
 * POST /api/customer/create-booking
 */
export async function createCustomerBooking(bookingData: {
  serviceIds: string[];
  staffId?: string;
  bookingDate: string;
  bookingTime: string;
  notes?: string;
}): Promise<any> {
  try {
    const response = await fetch("/api/customer/create-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create booking");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/**
 * GET /api/customer/profile
 */
export async function getCustomerProfile(): Promise<any> {
  try {
    const response = await fetch("/api/customer/profile");
    if (!response.ok) {
      throw new Error("Failed to get profile");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting profile:", error);
    throw error;
  }
}

/**
 * PUT /api/customer/profile
 */
export async function updateCustomerProfile(profileData: {
  firstName?: string;
  lastName?: string;
  birthday?: string;
  gender?: string;
  notes?: string;
  preferences?: any;
}): Promise<any> {
  try {
    const response = await fetch("/api/customer/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update profile");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * GET /api/customer/promotions
 */
export async function getCustomerPromotions(): Promise<Promotion[]> {
  try {
    const response = await fetch("/api/customer/promotions");
    if (!response.ok) {
      throw new Error("Failed to get promotions");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting promotions:", error);
    throw error;
  }
}

/**
 * GET /api/customer/notifications
 */
export async function getCustomerNotifications(): Promise<
  CustomerNotification[]
> {
  try {
    const response = await fetch("/api/customer/notifications");
    if (!response.ok) {
      throw new Error("Failed to get notifications");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw error;
  }
}

/**
 * GET /api/mina/customer-recommendations
 */
export async function getMinaRecommendations(): Promise<
  MinaRecommendation[]
> {
  try {
    const response = await fetch("/api/mina/customer-recommendations");
    if (!response.ok) {
      throw new Error("Failed to get recommendations");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw error;
  }
}

