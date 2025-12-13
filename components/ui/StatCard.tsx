"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  loading?: boolean;
  error?: boolean;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "#0c4a6e",
  iconBg = "#A4E3E3",
  trend,
  loading = false,
  error = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl shadow-sm p-6 border border-gray-100", className)} aria-busy="true" role="status">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" aria-hidden="true" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" aria-hidden="true" />
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" aria-hidden="true" />
          </div>
        </div>
        <span className="sr-only">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("bg-white rounded-xl shadow-sm p-6 border border-gray-100", className)}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-sm text-red-600">Lỗi tải dữ liệu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100", className)}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="p-3 rounded-lg flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <p className="font-bold text-gray-900 mb-1 text-3xl leading-tight">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-success-600" : "text-danger-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">
                {trend.label || "so với kỳ trước"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

