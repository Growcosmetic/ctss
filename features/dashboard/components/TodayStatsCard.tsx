"use client";

import React from "react";
import { TodayStats } from "../types";
import { DollarSign, Calendar, CheckCircle, XCircle, UserPlus, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TodayStatsCardProps {
  stats: TodayStats;
  showRevenue?: boolean;
}

export default function TodayStatsCard({ stats, showRevenue = true }: TodayStatsCardProps) {
  const revenueChange = stats.revenueChange || 0;
  const isRevenueUp = revenueChange > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Revenue Card */}
      {showRevenue && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            {revenueChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                isRevenueUp ? "text-green-600" : "text-red-600"
              }`}>
                {isRevenueUp ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(revenueChange).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Doanh thu hôm nay</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
      )}

      {/* Total Bookings */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="text-sm text-gray-600 mb-1">Tổng lịch hẹn</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
      </div>

      {/* Completed Bookings */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-600 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="text-sm text-gray-600 mb-1">Đã hoàn thành</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
      </div>

      {/* No-Show Count */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-red-600 rounded-lg">
            <XCircle className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="text-sm text-gray-600 mb-1">Không đến</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.noShowCount}</p>
      </div>

      {/* New Customers */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-600 rounded-lg">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="text-sm text-gray-600 mb-1">Khách mới</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.newCustomers}</p>
      </div>
    </div>
  );
}
