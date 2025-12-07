"use client";

import { useState } from "react";
import {
  getRevenueSummary,
  getServiceReport,
  getStaffReport,
  getBookingBehavior,
} from "../services/reportsApi";
import {
  RevenueSummary,
  ServiceReport,
  StaffReport,
  BookingBehavior,
  DateRange,
} from "../types";

export interface UseReportsReturn {
  loading: boolean;
  error: string | null;
  revenueSummary: RevenueSummary | null;
  serviceReport: ServiceReport[];
  staffReport: StaffReport[];
  bookingBehavior: BookingBehavior | null;
  loadSummary: (dateRange: DateRange) => Promise<void>;
  loadServiceReport: (dateRange: DateRange) => Promise<void>;
  loadStaffReport: (dateRange: DateRange) => Promise<void>;
  loadBehaviorReport: (dateRange: DateRange) => Promise<void>;
  loadAll: (dateRange: DateRange) => Promise<void>;
}

export function useReports(): UseReportsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [serviceReport, setServiceReport] = useState<ServiceReport[]>([]);
  const [staffReport, setStaffReport] = useState<StaffReport[]>([]);
  const [bookingBehavior, setBookingBehavior] = useState<BookingBehavior | null>(null);

  const loadSummary = async (dateRange: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRevenueSummary(dateRange);
      setRevenueSummary(data);
    } catch (err: any) {
      setError(err.message || "Failed to load revenue summary");
    } finally {
      setLoading(false);
    }
  };

  const loadServiceReport = async (dateRange: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServiceReport(dateRange);
      setServiceReport(data);
    } catch (err: any) {
      setError(err.message || "Failed to load service report");
    } finally {
      setLoading(false);
    }
  };

  const loadStaffReport = async (dateRange: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStaffReport(dateRange);
      setStaffReport(data);
    } catch (err: any) {
      setError(err.message || "Failed to load staff report");
    } finally {
      setLoading(false);
    }
  };

  const loadBehaviorReport = async (dateRange: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookingBehavior(dateRange);
      setBookingBehavior(data);
    } catch (err: any) {
      setError(err.message || "Failed to load booking behavior");
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async (dateRange: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const [summary, services, staff, behavior] = await Promise.all([
        getRevenueSummary(dateRange),
        getServiceReport(dateRange),
        getStaffReport(dateRange),
        getBookingBehavior(dateRange),
      ]);
      setRevenueSummary(summary);
      setServiceReport(services);
      setStaffReport(staff);
      setBookingBehavior(behavior);
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    revenueSummary,
    serviceReport,
    staffReport,
    bookingBehavior,
    loadSummary,
    loadServiceReport,
    loadStaffReport,
    loadBehaviorReport,
    loadAll,
  };
}

