"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar, RefreshCw } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface StaffHeaderProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function StaffHeader({
  onRefresh,
  refreshing = false,
}: StaffHeaderProps) {
  const { user } = useAuth();
  const today = format(new Date(), "EEEE, dd MMMM yyyy");

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Lịch làm việc của tôi
        </h1>
        <div className="flex items-center gap-2 mt-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm capitalize">{today}</span>
          {user && (
            <span className="text-sm text-gray-500">
              • {user.firstName} {user.lastName}
            </span>
          )}
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
          <span className="text-sm font-medium hidden md:inline">Làm mới</span>
        </button>
      )}
    </div>
  );
}

