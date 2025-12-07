"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { UsageTrend } from "../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UsageTrendsChartProps {
  trend: UsageTrend;
}

export default function UsageTrendsChart({ trend }: UsageTrendsChartProps) {
  // Mock data for chart (in production, would fetch historical data)
  const chartData = [
    { period: "Tuần 1", usage: trend.totalUsed * 0.8 },
    { period: "Tuần 2", usage: trend.totalUsed * 0.9 },
    { period: "Tuần 3", usage: trend.totalUsed * 1.1 },
    { period: "Tuần 4", usage: trend.totalUsed },
  ];

  const getTrendIcon = () => {
    if (trend.trend > 0) {
      return <TrendingUp className="w-5 h-5 text-red-600" />;
    } else if (trend.trend < 0) {
      return <TrendingDown className="w-5 h-5 text-green-600" />;
    } else {
      return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    if (trend.trend > 0) return "text-red-600";
    if (trend.trend < 0) return "text-green-600";
    return "text-gray-600";
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{trend.productName}</h3>
        <div className={`flex items-center gap-2 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm font-medium">
            {trend.trend > 0 ? "+" : ""}
            {trend.trend.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tổng sử dụng ({trend.period})</p>
            <p className="text-xl font-bold text-gray-900">
              {trend.totalUsed.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trung bình/dịch vụ</p>
            <p className="text-xl font-bold text-gray-900">
              {trend.averagePerService.toFixed(2)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Dự báo 30 ngày tới</p>
          <p className="text-lg font-semibold text-blue-600">
            {trend.forecastNext30Days.toFixed(2)}
          </p>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="usage"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

