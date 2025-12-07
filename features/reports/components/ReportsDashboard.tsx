"use client";

import React, { useState, useEffect } from "react";
import { useReports } from "../hooks/useReports";
import { DateRange } from "../types";
import DateRangePicker from "./DateRangePicker";
import RevenueSummaryCard from "./RevenueSummaryCard";
import RevenueChart from "./RevenueChart";
import TopServicesTable from "./TopServicesTable";
import StaffPerformanceTable from "./StaffPerformanceTable";
import BookingBehaviorCard from "./BookingBehaviorCard";
import { Loader2, AlertCircle } from "lucide-react";

export default function ReportsDashboard() {
  const {
    loading,
    error,
    revenueSummary,
    serviceReport,
    staffReport,
    bookingBehavior,
    loadAll,
  } = useReports();

  // Default to current month
  const getCurrentMonthRange = (): DateRange => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange());

  useEffect(() => {
    loadAll(dateRange);
  }, [dateRange]);

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={handleDateRangeChange}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Reports Content */}
      {!loading && (
        <>
          {/* Row 1: Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueSummaryCard summary={revenueSummary} loading={loading} />
            <BookingBehaviorCard behavior={bookingBehavior} loading={loading} />
          </div>

          {/* Row 2: Revenue Chart */}
          <RevenueChart summary={revenueSummary} loading={loading} />

          {/* Row 3: Tables Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopServicesTable services={serviceReport} loading={loading} />
            <StaffPerformanceTable staff={staffReport} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}

