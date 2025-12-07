// ============================================
// Branch API Service
// ============================================

import { Branch, BranchStaff, BranchKPIs } from "../types";

const API_BASE = "/api/branches";

/**
 * GET /api/branches
 */
export async function getBranches(): Promise<Branch[]> {
  try {
    const response = await fetch(API_BASE, {
      credentials: "include", // Important: include cookies
    });
    if (!response.ok) {
      // Return empty array instead of throwing to prevent page crash
      console.warn("Failed to get branches, returning empty array");
      return [];
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error getting branches:", error);
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * GET /api/branches/:id
 */
export async function getBranch(branchId: string): Promise<Branch> {
  try {
    const response = await fetch(`${API_BASE}/${branchId}`);
    if (!response.ok) {
      throw new Error("Failed to get branch");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting branch:", error);
    throw error;
  }
}

/**
 * GET /api/branches/:id/staff
 */
export async function getBranchStaff(branchId: string): Promise<BranchStaff[]> {
  try {
    const response = await fetch(`${API_BASE}/${branchId}/staff`);
    if (!response.ok) {
      throw new Error("Failed to get branch staff");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting branch staff:", error);
    throw error;
  }
}

/**
 * GET /api/branches/:id/kpis
 */
export async function getBranchKPIs(
  branchId: string,
  timeRange: "today" | "week" | "month" = "today"
): Promise<BranchKPIs> {
  try {
    const response = await fetch(
      `${API_BASE}/${branchId}/kpis?timeRange=${timeRange}`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) {
      console.warn("Failed to get branch KPIs, returning mock data");
      // Return mock KPIs
      return {
        branchId,
        branchName: "Chi nhánh mặc định",
        todayRevenue: 0,
        todayBookings: 0,
        todayStaffWorking: 0,
        weekRevenue: 0,
        weekBookings: 0,
        monthRevenue: 0,
        monthBookings: 0,
        topServices: [],
      };
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting branch KPIs:", error);
    // Return mock KPIs on error
    return {
      branchId,
      branchName: "Chi nhánh mặc định",
      todayRevenue: 0,
      todayBookings: 0,
      todayStaffWorking: 0,
      weekRevenue: 0,
      weekBookings: 0,
      monthRevenue: 0,
      monthBookings: 0,
      topServices: [],
    };
  }
}

/**
 * POST /api/branches
 */
export async function createBranch(branchData: {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  managerId?: string;
}): Promise<Branch> {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(branchData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create branch");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
}

/**
 * PUT /api/branches/:id
 */
export async function updateBranch(
  branchId: string,
  branchData: Partial<Branch>
): Promise<Branch> {
  try {
    const response = await fetch(`${API_BASE}/${branchId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(branchData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update branch");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
}

