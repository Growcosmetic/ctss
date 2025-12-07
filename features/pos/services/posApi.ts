// ============================================
// POS API Service
// ============================================

import { CheckoutRequest, CheckoutResponse, Invoice } from "../types";

const API_BASE = "/api/pos/checkout";

/**
 * GET /api/pos/checkout?bookingId=xxx
 * Load invoice for a booking
 */
export async function getCheckout(bookingId: string): Promise<CheckoutResponse | null> {
  try {
    const response = await fetch(`${API_BASE}?bookingId=${bookingId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No invoice found
      }
      throw new Error("Failed to load checkout");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error loading checkout:", error);
    throw error;
  }
}

/**
 * POST /api/pos/checkout
 * Create or update invoice
 */
export async function saveCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save checkout");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error saving checkout:", error);
    throw error;
  }
}

