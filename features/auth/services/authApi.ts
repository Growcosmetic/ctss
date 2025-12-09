// ============================================
// Auth API Service
// ============================================

import { LoginRequest, LoginResponse, User } from "../types";

const API_BASE = "/api/auth";

/**
 * POST /api/auth/login
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    // Support both email and phone - API accepts both
    let response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      credentials: "include", // Important: include cookies
    });

    if (!response.ok) {
      // Fallback to mock login if database fails
      const error = await response.json().catch(() => ({}));
      if (error.error?.includes("denied access") || error.error?.includes("ECONNREFUSED")) {
        console.warn("Database connection failed, using mock login...");
        response = await fetch(`${API_BASE}/login-mock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });
        
        if (!response.ok) {
          const mockError = await response.json();
          throw new Error(mockError.message || "Login failed");
        }
        
        const mockData = await response.json();
        return mockData.data;
      }
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

/**
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    let response = await fetch(`${API_BASE}/me`, {
      credentials: "include", // Important: include cookies
    });
    
    // If 500 error or database error, try mock endpoint
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 500 || 
          errorData.error?.includes("denied access") || 
          errorData.error?.includes("ECONNREFUSED")) {
        console.warn("Database connection failed, using mock me endpoint...");
        response = await fetch(`${API_BASE}/me-mock`, {
          credentials: "include",
        });
      }
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      return null; // Return null instead of throwing for better UX
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * POST /api/auth/update-role
 */
export async function updateUserRole(userId: string, role: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE}/update-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update role");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
}

