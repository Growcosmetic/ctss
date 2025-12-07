"use client";

import React from "react";
import KpiGrid from "./KpiGrid";
import RevenueLineChart from "./RevenueLineChart";
import CustomerBarChart from "./CustomerBarChart";
import TopServicesTable from "./TopServicesTable";
import TopStylistsList from "./TopStylistsList";

interface DashboardContentProps {
  stats: {
    revenueToday: number;
    profitToday: number;
    newCustomers: number;
    returningCustomers: number;
    avgTicket: number;
    upsellRate: number;
  };
  revenueChart: Array<{ date: string; revenue: number }>;
  customerChart: Array<{ date: string; customers: number }>;
  topServices: Array<{
    id: string;
    name: string;
    count: number;
    revenue: number;
    profit: number;
    trend: number;
  }>;
  topStylists: Array<{
    id: string;
    name: string;
    avatar?: string;
    revenue: number;
    upsellRate: number;
    rating: number;
    trend: number;
  }>;
}

export default function DashboardContent({
  stats,
  revenueChart,
  customerChart,
  topServices,
  topStylists,
}: DashboardContentProps) {
  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan hệ thống CTSS</p>
      </div>

      {/* KPI Grid */}
      <KpiGrid stats={stats} />

      {/* Charts and Tables */}
      <div className="space-y-6">
        {/* Revenue Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Line Chart 30 Days
          </h3>
          <RevenueLineChart data={revenueChart} height={300} />
        </div>

        {/* Customer Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Bar Chart
          </h3>
          <CustomerBarChart
            data={customerChart.map((item) => ({
              date: item.date,
              customers: item.customers || 0,
            }))}
            height={300}
          />
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopServicesTable data={topServices} />
          <TopStylistsList data={topStylists} />
        </div>
      </div>
    </div>
  );
}
