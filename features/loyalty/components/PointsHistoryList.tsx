"use client";

import React from "react";
import { LoyaltyPoint } from "../types";
import { format } from "date-fns";
import { Plus, Minus, Loader2 } from "lucide-react";

interface PointsHistoryListProps {
  history: LoyaltyPoint[];
  loading?: boolean;
}

export default function PointsHistoryList({
  history,
  loading,
}: PointsHistoryListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có lịch sử điểm tích lũy</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((point) => {
        const isEarned = point.points > 0;
        return (
          <div
            key={point.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {isEarned ? (
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-red-100 rounded-lg">
                  <Minus className="w-4 h-4 text-red-600" />
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {point.description || (isEarned ? "Tích điểm" : "Đổi điểm")}
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(point.createdAt), "dd/MM/yyyy HH:mm")}
                </div>
              </div>
            </div>
            <div
              className={`font-semibold ${
                isEarned ? "text-green-600" : "text-red-600"
              }`}
            >
              {isEarned ? "+" : ""}
              {point.points.toLocaleString("vi-VN")}
            </div>
          </div>
        );
      })}
    </div>
  );
}

