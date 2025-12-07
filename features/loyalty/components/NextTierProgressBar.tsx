"use client";

import React from "react";
import { LoyaltyTier } from "../types";
import { TrendingUp, Award } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface NextTierProgressBarProps {
  currentTier: LoyaltyTier | null;
  nextTier: LoyaltyTier | null;
  spendingLast6Months: number;
  pointsToNextTier: number;
}

export default function NextTierProgressBar({
  currentTier,
  nextTier,
  spendingLast6Months,
  pointsToNextTier,
}: NextTierProgressBarProps) {
  if (!nextTier) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Bạn đã đạt hạng cao nhất!</h3>
        </div>
        {currentTier && (
          <p className="text-sm text-gray-600">
            Hạng hiện tại: <span className="font-medium">{currentTier.name}</span>
          </p>
        )}
      </div>
    );
  }

  const currentSpend = spendingLast6Months;
  const nextTierMinSpend = Number(nextTier.minSpend);
  const progress = Math.min(100, (currentSpend / nextTierMinSpend) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Hạng tiếp theo: {nextTier.name}</h3>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Chi tiêu 6 tháng gần đây</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(currentSpend)} / {formatCurrency(nextTierMinSpend)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 text-right">
          Còn thiếu: {formatCurrency(pointsToNextTier)} để lên hạng {nextTier.name}
        </div>
      </div>
    </div>
  );
}

