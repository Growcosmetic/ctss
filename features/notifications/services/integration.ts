// ============================================
// Notification Integration Helpers
// ============================================

/**
 * Call this after creating a booking (from API or frontend)
 */
export async function notifyBookingCreated(bookingId: string): Promise<void> {
  try {
    await fetch("/api/notifications/trigger/booking-created", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
  } catch (error) {
    console.error("Error triggering booking created notification:", error);
  }
}

/**
 * Call this after updating a booking
 */
export async function notifyBookingUpdated(bookingId: string): Promise<void> {
  try {
    await fetch("/api/notifications/trigger/booking-updated", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
  } catch (error) {
    console.error("Error triggering booking updated notification:", error);
  }
}

/**
 * Call this after cancelling a booking
 */
export async function notifyBookingCancelled(bookingId: string): Promise<void> {
  try {
    await fetch("/api/notifications/trigger/booking-cancelled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
  } catch (error) {
    console.error("Error triggering booking cancelled notification:", error);
  }
}

/**
 * Call this after payment is completed
 */
export async function notifyAfterPayment(
  customerId: string,
  invoiceId: string
): Promise<void> {
  try {
    await fetch("/api/notifications/trigger/after-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, invoiceId }),
    });
  } catch (error) {
    console.error("Error triggering after payment notification:", error);
  }
}

/**
 * Call this when high-risk customer is detected
 */
export async function notifyHighRiskCustomer(customerId: string): Promise<void> {
  try {
    await fetch("/api/notifications/trigger/high-risk-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
  } catch (error) {
    console.error("Error triggering high-risk customer notification:", error);
  }
}

