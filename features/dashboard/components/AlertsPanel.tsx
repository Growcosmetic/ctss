"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DashboardAlert } from "../types";
import { AlertTriangle, Flame, Info, TrendingDown } from "lucide-react";

interface AlertsPanelProps {
  alerts: DashboardAlert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case "churn-risk":
        return <Flame className="w-5 h-5 text-red-600" />;
      case "revenue":
        return <TrendingDown className="w-5 h-5 text-orange-600" />;
      case "system":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-300 bg-red-50";
      case "medium":
        return "border-yellow-300 bg-yellow-50";
      default:
        return "border-blue-300 bg-blue-50";
    }
  };

  const handleClick = (alert: DashboardAlert) => {
    if (alert.actionUrl) {
      router.push(alert.actionUrl);
    } else if (alert.data) {
      if (alert.data.bookingId) {
        router.push(`/booking?bookingId=${alert.data.bookingId}`);
      } else if (alert.data.customerId) {
        router.push(`/crm?customerId=${alert.data.customerId}`);
      }
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cảnh báo</h2>
        <p className="text-center text-gray-500 text-sm">Không có cảnh báo nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Cảnh báo</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => handleClick(alert)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(
              alert.priority
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">
                  {alert.title}
                </h3>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
              <span className="text-2xl flex-shrink-0">{alert.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

