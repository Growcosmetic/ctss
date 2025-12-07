"use client";

import React from "react";
import { LoyaltyTier } from "../types";
import { Gift, Percent, Star } from "lucide-react";

interface TierBenefitsCardProps {
  tier: LoyaltyTier | null;
}

export default function TierBenefitsCard({ tier }: TierBenefitsCardProps) {
  if (!tier) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quyền lợi hạng thành viên</h3>
        <p className="text-sm text-gray-500">Chưa có hạng thành viên</p>
      </div>
    );
  }

  const perks = (tier.perks as string[]) || [];
  const discountPercent = Number(tier.discountPercent);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Quyền lợi hạng {tier.name}</h3>
      <div className="space-y-3">
        {discountPercent > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Percent className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">
                Giảm giá {discountPercent}%
              </div>
              <div className="text-xs text-gray-600">
                Áp dụng cho tất cả dịch vụ
              </div>
            </div>
          </div>
        )}
        {perks.length > 0 && (
          <div className="space-y-2">
            {perks.map((perk, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <Gift className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{perk}</span>
              </div>
            ))}
          </div>
        )}
        {perks.length === 0 && discountPercent === 0 && (
          <p className="text-sm text-gray-500">Chưa có quyền lợi đặc biệt</p>
        )}
      </div>
    </div>
  );
}

