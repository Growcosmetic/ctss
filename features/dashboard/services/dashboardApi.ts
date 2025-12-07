// ============================================
// Dashboard API Service
// ============================================

import {
  TodayStats,
  StaffPerformance,
  TimelineSlot,
  DashboardAlert,
  DashboardData,
} from "../types";

const API_BASE = "/api/dashboard";

/**
 * GET /api/dashboard/stats
 */
export async function getTodayStats(): Promise<TodayStats> {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) {
      throw new Error("Failed to get today stats");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting today stats:", error);
    throw error;
  }
}

/**
 * GET /api/dashboard/staff-performance
 */
export async function getTodayStaffPerformance(): Promise<StaffPerformance[]> {
  try {
    const response = await fetch(`${API_BASE}/staff-performance`);
    if (!response.ok) {
      throw new Error("Failed to get staff performance");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting staff performance:", error);
    throw error;
  }
}

/**
 * GET /api/dashboard/timeline
 */
export async function getBookingTimeline(): Promise<TimelineSlot[]> {
  try {
    const response = await fetch(`${API_BASE}/timeline`);
    if (!response.ok) {
      throw new Error("Failed to get booking timeline");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting booking timeline:", error);
    throw error;
  }
}

/**
 * GET /api/dashboard/alerts
 */
export async function getAlerts(): Promise<DashboardAlert[]> {
  try {
    const response = await fetch(`${API_BASE}/alerts`);
    if (!response.ok) {
      throw new Error("Failed to get alerts");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting alerts:", error);
    throw error;
  }
}

/**
 * GET /api/dashboard/all
 */
export async function getAllDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch(`${API_BASE}/all`);
    if (!response.ok) {
      throw new Error("Failed to get dashboard data");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    throw error;
  }
}
