"use client";

import React from "react";
import { User, Calendar, DollarSign, TrendingUp, TrendingDown, Minus, UserCheck } from "lucide-react";
import { CustomerSummary } from "../types";
import { format } from "date-fns";

interface MinaCustomerSummaryCardProps {
  summary: CustomerSummary | null;
  loading?: boolean;
}

export default function MinaCustomerSummaryCard({
  summary,
  loading,
}: MinaCustomerSummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500">Chưa có dữ liệu</p>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (summary.spendingPattern.trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (summary.spendingPattern.trend) {
      case "increasing":
        return "text-green-600";
      case "decreasing":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Tóm tắt khách hàng (AI Mina)</h3>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Tổng lần đến</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{summary.basicInfo.totalVisits}</p>
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Tổng chi tiêu</span>
          </div>
          <p className="text-xl font-bold text-green-600">
            {summary.basicInfo.totalSpent.toLocaleString("vi-VN")} đ
          </p>
        </div>
      </div>

      {/* Spending Pattern */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Xu hướng chi tiêu</span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {summary.spendingPattern.trend === "increasing"
                ? "Tăng"
                : summary.spendingPattern.trend === "decreasing"
                ? "Giảm"
                : "Ổn định"}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Trung bình: {summary.spendingPattern.averageSpending.toLocaleString("vi-VN")} đ/lần
        </p>
      </div>

      {/* Stylist Preference */}
      {summary.stylistPreference && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <span className="text-sm text-gray-600">Stylist ưa thích: </span>
          <span className="font-medium text-purple-600">
            {summary.stylistPreference.staffName}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            ({summary.stylistPreference.visitCount} lần)
          </span>
        </div>
      )}

      {/* Recent Visits */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">3 lần đến gần nhất</h4>
        <div className="space-y-2">
          {summary.recentVisits.map((visit, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {format(new Date(visit.date), "dd/MM/yyyy")}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{visit.serviceName}</p>
                <p className="text-xs text-gray-500">
                  {visit.amount.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Flags */}
      {summary.warningFlags.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Cảnh báo</h4>
          <ul className="space-y-1">
            {summary.warningFlags.map((flag, index) => (
              <li key={index} className="text-xs text-yellow-700">
                • {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

