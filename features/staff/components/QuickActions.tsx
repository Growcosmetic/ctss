"use client";

import React from "react";
import { StaffBooking } from "../types";
import { PlayCircle, CheckCircle, User, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  booking: StaffBooking | null;
  onStartService: () => void;
  onCompleteService: () => void;
  disabled?: boolean;
}

export default function QuickActions({
  booking,
  onStartService,
  onCompleteService,
  disabled,
}: QuickActionsProps) {
  const router = useRouter();

  if (!booking) {
    return null;
  }

  const canStart = booking.status === "UPCOMING";
  const canComplete = booking.status === "IN_SERVICE";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Thao tác nhanh</h3>
      <div className="grid grid-cols-2 gap-2">
        {canStart && (
          <button
            onClick={onStartService}
            disabled={disabled}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Bắt đầu</span>
          </button>
        )}

        {canComplete && (
          <button
            onClick={onCompleteService}
            disabled={disabled}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Hoàn thành</span>
          </button>
        )}

        <button
          onClick={() => {
            if (booking.customerId) {
              router.push(`/crm?customerId=${booking.customerId}`);
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">Hồ sơ</span>
        </button>

        <button
          onClick={() => router.push("/mina")}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Mina AI</span>
        </button>
      </div>
    </div>
  );
}

