"use client";

import React from "react";
import { Award, Coins, TrendingUp } from "lucide-react";
import { CustomerLoyaltyInfo } from "../types";
import LoyaltyTierBadge from "@/features/loyalty/components/LoyaltyTierBadge";
import { formatCurrency } from "@/lib/utils";

interface LoyaltySummaryCardProps {
  loyalty: CustomerLoyaltyInfo | null;
  loading?: boolean;
}

export default function LoyaltySummaryCard({
  loyalty,
  loading,
}: LoyaltySummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!loyalty) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <p className="text-gray-500 text-center">Chưa có thông tin thành viên</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Thành viên
        </h3>
        {loyalty.tier && <LoyaltyTierBadge tierName={loyalty.tier.name} />}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Điểm tích lũy</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            {loyalty.totalPoints.toLocaleString("vi-VN")}
          </span>
        </div>

        {loyalty.nextTier && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Hạng tiếp theo:</span>
              <span className="font-medium text-gray-900">
                {loyalty.nextTier.name}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    loyalty.spendingLast6Months > 0
                      ? Math.min(
                          100,
                          (loyalty.spendingLast6Months /
                            Number(loyalty.nextTier.minSpend)) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500">
              Còn thiếu: {formatCurrency(loyalty.pointsToNextTier)} để lên hạng{" "}
              {loyalty.nextTier.name}
            </div>
          </div>
        )}

        {loyalty.tier && Number(loyalty.tier.discountPercent) > 0 && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                Bạn được giảm giá {loyalty.tier.discountPercent}% cho tất cả dịch vụ
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

