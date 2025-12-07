"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  format?: "currency" | "number" | "percent";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function KpiCard({
  title,
  value,
  icon: Icon,
  format = "number",
  trend,
}: KpiCardProps) {
  const formatValue = () => {
    if (format === "currency") {
      return formatCurrency(value);
    }
    if (format === "percent") {
      return `${Number(value).toFixed(1)}%`;
    }
    return new Intl.NumberFormat("vi-VN").format(Number(value));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start gap-4">
        {/* Icon bên trái */}
        <div
          className="p-3 rounded-lg flex-shrink-0"
          style={{ backgroundColor: "#A4E3E3" }}
        >
          <Icon className="w-6 h-6" style={{ color: "#0c4a6e" }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <p
            className="font-bold text-gray-900 mb-1"
            style={{ fontSize: "32px", lineHeight: "1.2" }}
          >
            {formatValue()}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">so với kỳ trước</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
