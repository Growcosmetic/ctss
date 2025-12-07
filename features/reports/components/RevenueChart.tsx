"use client";

import React from "react";
import { RevenueSummary } from "../types";

interface RevenueChartProps {
  summary: RevenueSummary | null;
  loading?: boolean;
}

export default function RevenueChart({ summary, loading }: RevenueChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!summary || summary.revenueByDay.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ doanh thu</h3>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...summary.revenueByDay.map((d) => d.revenue));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ doanh thu theo ngày</h3>
      <div className="space-y-2">
        {summary.revenueByDay.map((day) => {
          const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
          return (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-32 text-right">
                <div className="text-sm font-medium text-gray-900">
                  {day.revenue.toLocaleString("vi-VN")} đ
                </div>
                <div className="text-xs text-gray-500">{day.count} hóa đơn</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

