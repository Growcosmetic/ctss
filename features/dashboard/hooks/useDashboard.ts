"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTodayStats,
  getTodayStaffPerformance,
  getBookingTimeline,
  getAlerts,
  getAllDashboardData,
} from "../services/dashboardApi";
import {
  TodayStats,
  StaffPerformance,
  TimelineSlot,
  DashboardAlert,
  DashboardData,
} from "../types";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getAllDashboardData();
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTodayStats = useCallback(async () => {
    try {
      const stats = await getTodayStats();
      setData((prev) => (prev ? { ...prev, stats } : null));
    } catch (err: any) {
      console.error("Error loading stats:", err);
    }
  }, []);

  const loadStaffPerformance = useCallback(async () => {
    try {
      const performance = await getTodayStaffPerformance();
      setData((prev) => (prev ? { ...prev, staffPerformance: performance } : null));
    } catch (err: any) {
      console.error("Error loading staff performance:", err);
    }
  }, []);

  const loadTimeline = useCallback(async () => {
    try {
      const timeline = await getBookingTimeline();
      setData((prev) => (prev ? { ...prev, timeline } : null));
    } catch (err: any) {
      console.error("Error loading timeline:", err);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const alerts = await getAlerts();
      setData((prev) => (prev ? { ...prev, alerts } : null));
    } catch (err: any) {
      console.error("Error loading alerts:", err);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadAll();

    const interval = setInterval(() => {
      loadAll();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadAll]);

  return {
    data,
    loading,
    error,
    loadAll,
    loadTodayStats,
    loadStaffPerformance,
    loadTimeline,
    loadAlerts,
    refresh: loadAll,
  };
}
