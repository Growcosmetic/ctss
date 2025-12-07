"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface RevenueLineChartProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
  height?: number;
}

export default function RevenueLineChart({ data, height = 300 }: RevenueLineChartProps) {
  const formattedData = data.map((item) => {
    try {
      const date = typeof item.date === 'string' ? parseISO(item.date) : new Date(item.date);
      return {
        date: format(date, "dd/MM"),
        revenue: item.revenue || 0,
      };
    } catch (e) {
      return {
        date: item.date,
        revenue: item.revenue || 0,
      };
    }
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200" style={{ borderRadius: "8px" }}>
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-gray-500">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#6b7280" }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#6b7280" }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#6CCAC4"
          strokeWidth={3}
          dot={{ fill: "#6CCAC4", r: 4 }}
          activeDot={{ r: 6, stroke: "#6CCAC4", strokeWidth: 2 }}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
