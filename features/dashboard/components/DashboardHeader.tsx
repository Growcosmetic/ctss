"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function DashboardHeader({
  onRefresh,
  refreshing = false,
}: DashboardHeaderProps) {
  const today = format(new Date(), "EEEE, dd MMMM yyyy");

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2 mt-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm capitalize">{today}</span>
        </div>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span className="text-sm font-medium">Làm mới</span>
        </button>
      )}
    </div>
  );
}

