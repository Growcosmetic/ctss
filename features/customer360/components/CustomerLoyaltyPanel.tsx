// ============================================
// Customer360 Loyalty Panel
// ============================================

"use client";

import React from "react";
import { Award, Coins, TrendingUp, Sparkles } from "lucide-react";
import type { CustomerLoyaltyInfo } from "../types";

interface CustomerLoyaltyPanelProps {
  loyalty: CustomerLoyaltyInfo;
}

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  SILVER: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-300",
  },
  GOLD: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  PLATINUM: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  DIAMOND: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-300",
  },
};

const tierLabels: Record<string, string> = {
  SILVER: "Bạc",
  GOLD: "Vàng",
  PLATINUM: "Bạch Kim",
  DIAMOND: "Kim Cương",
};

export function CustomerLoyaltyPanel({ loyalty }: CustomerLoyaltyPanelProps) {
  if (!loyalty) return null;

  const tier = loyalty.tier?.toUpperCase() || "";
  const tierColor = tierColors[tier] || tierColors.SILVER;
  const tierLabel = tier ? tierLabels[tier] || tier : "Chưa xếp hạng";

  if (!loyalty) return null;

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Thành viên & Tích điểm
        </h3>
      </div>

      {/* Current Tier */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Hạng hiện tại</span>
          <span
            className={`px-4 py-2 rounded-lg font-semibold text-sm border ${tierColor.bg} ${tierColor.text} ${tierColor.border}`}
          >
            {tierLabel}
          </span>
        </div>
      </div>

      {/* Points Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">Điểm hiện tại</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {(loyalty?.totalPoints ?? 0).toLocaleString("vi-VN")}
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-600">Điểm trọn đời</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {(loyalty?.lifetimePoints ?? 0).toLocaleString("vi-VN")}
          </div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {loyalty.nextTier && loyalty.progressPercent !== undefined && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Tiến độ lên hạng {tierLabels[loyalty.nextTier.toUpperCase()] || loyalty.nextTier}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(loyalty.progressPercent)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, loyalty.progressPercent))}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 text-center">
            Còn thiếu để lên hạng {tierLabels[loyalty.nextTier.toUpperCase()] || loyalty.nextTier}
          </p>
        </div>
      )}

      {!loyalty.nextTier && (
        <div className="text-center py-4 text-sm text-gray-500">
          <p>Bạn đã đạt hạng cao nhất! 🎉</p>
        </div>
      )}
    </div>
  );
}

