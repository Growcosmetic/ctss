"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface CustomerBarChartProps {
  data: Array<{
    date: string;
    customers: number;
  }>;
  height?: number;
}

export default function CustomerBarChart({ data, height = 300 }: CustomerBarChartProps) {
  const formattedData = data.map((item) => {
    try {
      const date = typeof item.date === 'string' ? parseISO(item.date) : new Date(item.date);
      return {
        date: format(date, "dd/MM"),
        customers: item.customers || 0,
      };
    } catch (e) {
      return {
        date: item.date,
        customers: item.customers || 0,
      };
    }
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200" style={{ borderRadius: "8px" }}>
          <p className="text-sm font-medium text-gray-900">
            {payload[0].value} khách hàng
          </p>
          <p className="text-xs text-gray-500">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
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
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="customers"
          fill="#A4E3E3"
          radius={[6, 6, 0, 0]}
          animationDuration={500}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
