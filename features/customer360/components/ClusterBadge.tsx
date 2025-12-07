// ============================================
// Customer360 Cluster Badge
// ============================================

"use client";

import React from "react";
import {
  Crown,
  Sparkles,
  DollarSign,
  UserX,
  Palette,
  Waves,
  Tag,
} from "lucide-react";

interface ClusterBadgeProps {
  cluster: string;
  size?: "sm" | "md" | "lg";
}

const clusterConfig: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    icon: React.ElementType;
    label: string;
  }
> = {
  "High Loyalty Premium": {
    bg: "bg-gradient-to-r from-purple-100 to-purple-200",
    text: "text-purple-700",
    border: "border-purple-300",
    icon: Crown,
    label: "VIP Trung Thành",
  },
  "Trend Lover": {
    bg: "bg-gradient-to-r from-pink-100 to-pink-200",
    text: "text-pink-700",
    border: "border-pink-300",
    icon: Sparkles,
    label: "Yêu Thích Xu Hướng",
  },
  "Value Seeker": {
    bg: "bg-gradient-to-r from-blue-100 to-blue-200",
    text: "text-blue-700",
    border: "border-blue-300",
    icon: DollarSign,
    label: "Tìm Giá Tốt",
  },
  "Low Engagement": {
    bg: "bg-gradient-to-r from-gray-200 to-gray-300",
    text: "text-gray-700",
    border: "border-gray-400",
    icon: UserX,
    label: "Ít Tương Tác",
  },
  "Color-Focused": {
    bg: "bg-gradient-to-r from-yellow-100 to-amber-200",
    text: "text-yellow-700",
    border: "border-yellow-300",
    icon: Palette,
    label: "Tập Trung Nhuộm",
  },
  "Perm-Focused": {
    bg: "bg-gradient-to-r from-teal-100 to-cyan-200",
    text: "text-teal-700",
    border: "border-teal-300",
    icon: Waves,
    label: "Tập Trung Uốn",
  },
  "Regular Customer": {
    bg: "bg-gradient-to-r from-gray-100 to-gray-200",
    text: "text-gray-600",
    border: "border-gray-300",
    icon: Tag,
    label: "Khách Hàng Thường",
  },
};

export function ClusterBadge({ cluster, size = "md" }: ClusterBadgeProps) {
  const config =
    clusterConfig[cluster] ||
    clusterConfig["Regular Customer"] ||
    {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-300",
      icon: Tag,
      label: cluster || "Không xác định",
    };

  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border shadow-sm ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </span>
  );
}

