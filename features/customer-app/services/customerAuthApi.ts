// ============================================
// Customer Auth API Service
// ============================================

export interface SendOTPResponse {
  message: string;
  otpCode?: string; // Only in development
}

export interface VerifyOTPResponse {
  token: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface CustomerMeResponse {
  customer: any;
  loyalty: any;
}

/**
 * POST /api/customer-auth/send-otp
 */
export async function sendOTP(phone: string): Promise<SendOTPResponse> {
  try {
    const response = await fetch("/api/customer-auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send OTP");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

/**
 * POST /api/customer-auth/verify-otp
 */
export async function verifyOTP(
  phone: string,
  otpCode: string
): Promise<VerifyOTPResponse> {
  try {
    const response = await fetch("/api/customer-auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otpCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to verify OTP");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

/**
 * GET /api/customer-auth/me
 */
export async function getCustomerMe(): Promise<CustomerMeResponse> {
  try {
    const response = await fetch("/api/customer-auth/me");

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to get customer info");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting customer info:", error);
    throw error;
  }
}

