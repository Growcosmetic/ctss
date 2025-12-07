"use client";

import React from "react";
import { LoyaltyTier } from "../types";
import { Award } from "lucide-react";

interface LoyaltyTierBadgeProps {
  tier: LoyaltyTier | null;
  size?: "sm" | "md" | "lg";
}

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Silver: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
  },
  Gold: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  Platinum: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  Diamond: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
  },
};

const tierSizes = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

export default function LoyaltyTierBadge({
  tier,
  size = "md",
}: LoyaltyTierBadgeProps) {
  if (!tier) {
    return (
      <div
        className={`inline-flex items-center gap-1 ${tierSizes[size]} bg-gray-100 text-gray-600 border border-gray-300 rounded-full`}
      >
        <Award className="w-3 h-3" />
        <span>Chưa có hạng</span>
      </div>
    );
  }

  const colors = tierColors[tier.name] || tierColors.Silver;

  return (
    <div
      className={`inline-flex items-center gap-1 ${tierSizes[size]} ${colors.bg} ${colors.text} border ${colors.border} rounded-full font-medium`}
    >
      <Award className="w-4 h-4" />
      <span>{tier.name}</span>
    </div>
  );
}

