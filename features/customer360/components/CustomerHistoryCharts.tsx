// ============================================
// Customer360 History Charts
// ============================================

"use client";

import React, { useMemo } from "react";
import { TrendingUp, Calendar, Receipt, BarChart3 } from "lucide-react";
import type { CustomerVisitFrequency, CustomerInvoiceHistory } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CustomerHistoryChartsProps {
  visitFrequency: CustomerVisitFrequency;
  invoiceHistory: CustomerInvoiceHistory[];
}

export function CustomerHistoryCharts({
  visitFrequency,
  invoiceHistory,
}: CustomerHistoryChartsProps) {
  const totalVisits = visitFrequency?.totalVisits ?? 0;
  const avgInterval = visitFrequency?.avgVisitInterval ?? null;
  const invoiceCount = invoiceHistory?.length ?? 0;

  // Calculate monthly visit distribution for chart
  const monthlyData = useMemo(() => {
    if (!invoiceHistory || invoiceHistory.length === 0) return [];

    const months: Record<string, number> = {};
    invoiceHistory.forEach((inv) => {
      try {
        const date = new Date(inv.date);
        const monthKey = format(date, "MM/yyyy", { locale: vi });
        months[monthKey] = (months[monthKey] || 0) + 1;
      } catch {
        // Skip invalid dates
      }
    });

    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12); // Last 12 months
  }, [invoiceHistory]);

  // Calculate max value for chart scaling
  const maxValue = useMemo(() => {
    if (monthlyData.length === 0) return 1;
    return Math.max(...monthlyData.map(([, count]) => count));
  }, [monthlyData]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    if (!invoiceHistory || invoiceHistory.length === 0) return 0;
    return invoiceHistory.reduce((sum, inv) => sum + inv.total, 0);
  }, [invoiceHistory]);

  if (!visitFrequency && (!invoiceHistory || invoiceHistory.length === 0)) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Thống kê lịch sử
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có dữ liệu thống kê</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Thống kê lịch sử
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Visits */}
        <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-0.5 rounded-full">
              Tổng lượt
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-700 mb-1">
            {totalVisits}
          </div>
          <div className="text-xs text-blue-600">Lượt đến salon</div>
        </div>

        {/* Average Interval */}
        <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
              Trung bình
            </span>
          </div>
          <div className="text-3xl font-bold text-green-700 mb-1">
            {avgInterval !== null ? `${Math.round(avgInterval)}` : "--"}
          </div>
          <div className="text-xs text-green-600">
            {avgInterval !== null ? "ngày / lần" : "Chưa có dữ liệu"}
          </div>
        </div>

        {/* Invoice Count */}
        <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Receipt className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-0.5 rounded-full">
              Hóa đơn
            </span>
          </div>
          <div className="text-3xl font-bold text-purple-700 mb-1">
            {invoiceCount}
          </div>
          <div className="text-xs text-purple-600">
            Tổng giá trị: {totalRevenue.toLocaleString("vi-VN")}₫
          </div>
        </div>
      </div>

      {/* Simple Bar Chart - Monthly Distribution */}
      {monthlyData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Tần suất sử dụng (12 tháng gần nhất)
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {monthlyData.length} tháng
            </span>
          </div>

          <div className="flex items-end gap-1.5 h-32 bg-gray-50 rounded-lg p-3 border border-gray-200">
            {monthlyData.map(([month, count], index) => {
              const height = maxValue > 0 ? (count / maxValue) * 100 : 0;
              const isPeak = count === maxValue;

              return (
                <div key={month} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full flex items-end justify-center h-full">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isPeak
                          ? "bg-gradient-to-t from-purple-500 to-purple-400"
                          : "bg-gradient-to-t from-blue-400 to-blue-300"
                      } hover:opacity-80 cursor-pointer`}
                      style={{
                        height: `${Math.max(10, height)}%`,
                        minHeight: count > 0 ? "4px" : "0",
                      }}
                      title={`${month}: ${count} ${count === 1 ? "lần" : "lần"}`}
                    />
                  </div>
                  <div className="mt-2 text-[10px] text-gray-500 font-medium transform -rotate-45 origin-top-left whitespace-nowrap">
                    {month.split("/")[0]}
                  </div>
                  {count > 0 && (
                    <div className="mt-1 text-[10px] font-semibold text-gray-700">
                      {count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-400"></div>
              <span>Bình thường</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span>Cao nhất</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State for Chart */}
      {monthlyData.length === 0 && invoiceCount > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center py-4">
          <p className="text-sm text-gray-500">
            Chưa đủ dữ liệu để hiển thị biểu đồ
          </p>
        </div>
      )}
    </div>
  );
}

