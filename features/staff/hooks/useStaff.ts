"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getStaffTodayBookings,
  getServiceChecklist,
  saveServiceChecklist,
  markServiceStatus,
  getCustomerQuickInfo,
} from "../services/staffApi";
import {
  StaffBooking,
  ServiceChecklist,
  CustomerQuickInfo,
} from "../types";

export function useStaff() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<StaffBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<StaffBooking | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerQuickInfo | null>(null);
  const [checklist, setChecklist] = useState<ServiceChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load today's bookings
  const loadTodayBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStaffTodayBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load customer quick info
  const loadCustomerQuickInfo = useCallback(async (customerId: string) => {
    try {
      const info = await getCustomerQuickInfo(customerId);
      setCustomerInfo(info);
    } catch (err: any) {
      console.error("Error loading customer info:", err);
    }
  }, []);

  // Load checklist
  const loadChecklist = useCallback(async (bookingId: string) => {
    try {
      const data = await getServiceChecklist(bookingId);
      setChecklist(data);
    } catch (err: any) {
      console.error("Error loading checklist:", err);
    }
  }, []);

  // Save checklist
  const saveChecklist = useCallback(
    async (checklistData: ServiceChecklist) => {
      try {
        const saved = await saveServiceChecklist(checklistData);
        setChecklist(saved);
      } catch (err: any) {
        console.error("Error saving checklist:", err);
        throw err;
      }
    },
    []
  );

  // Start service
  const startService = useCallback(async (bookingId: string) => {
    try {
      await markServiceStatus(bookingId, "IN_SERVICE");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "IN_SERVICE" } : b
        )
      );
    } catch (err: any) {
      console.error("Error starting service:", err);
      throw err;
    }
  }, []);

  // Complete service
  const completeService = useCallback(async (bookingId: string) => {
    try {
      await markServiceStatus(bookingId, "COMPLETED");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "COMPLETED" } : b
        )
      );
    } catch (err: any) {
      console.error("Error completing service:", err);
      throw err;
    }
  }, []);

  // Load bookings on mount
  useEffect(() => {
    if (user) {
      loadTodayBookings();
    }
  }, [user, loadTodayBookings]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadTodayBookings();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, loadTodayBookings]);

  return {
    bookings,
    selectedBooking,
    setSelectedBooking,
    customerInfo,
    checklist,
    loading,
    error,
    loadTodayBookings,
    loadCustomerQuickInfo,
    loadChecklist,
    saveChecklist,
    startService,
    completeService,
  };
}

