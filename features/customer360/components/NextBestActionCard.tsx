// ============================================
// Customer360 Next Best Action Card
// ============================================

"use client";

import React from "react";
import {
  Target,
  Scissors,
  Phone,
  Megaphone,
  UserCog,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import type { CustomerNBAAction } from "../types";

interface NextBestActionCardProps {
  nba: CustomerNBAAction;
}

export function NextBestActionCard({ nba }: NextBestActionCardProps) {
  if (!nba) return null;

  const getPriorityConfig = () => {
    switch (nba.priorityLevel) {
      case "HIGH":
        return {
          text: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: AlertCircle,
          iconColor: "text-red-600",
          label: "CAO",
          description: "Cần xử lý ngay",
        };
      case "MEDIUM":
        return {
          text: "text-amber-700",
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: Clock,
          iconColor: "text-amber-600",
          label: "TRUNG BÌNH",
          description: "Theo dõi định kỳ",
        };
      default: // LOW
        return {
          text: "text-green-700",
          bg: "bg-green-50",
          border: "border-green-200",
          icon: CheckCircle,
          iconColor: "text-green-600",
          label: "THẤP",
          description: "Duy trì tốt",
        };
    }
  };

  const priorityConfig = getPriorityConfig();
  const PriorityIcon = priorityConfig.icon;

  const actionCards = [
    {
      title: "Stylist",
      label: "💇 Stylist",
      advice: nba.stylistAdvice,
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200",
      titleColor: "text-blue-700",
      icon: Scissors,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Receptionist",
      label: "📞 Lễ tân",
      advice: nba.receptionistAdvice,
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      border: "border-green-200",
      titleColor: "text-green-700",
      icon: Phone,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      title: "Marketing",
      label: "📣 Marketing",
      advice: nba.marketingAdvice,
      bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
      border: "border-yellow-200",
      titleColor: "text-yellow-700",
      icon: Megaphone,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
    },
    {
      title: "Manager",
      label: "🧑‍💼 Quản lý",
      advice: nba.managerAdvice,
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
      border: "border-purple-200",
      titleColor: "text-purple-700",
      icon: UserCog,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
  ];

  if (!nba) return null;

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Next Best Actions (AI)
          </h3>
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </div>
      </div>

      {/* Priority Badge */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm mb-6 ${priorityConfig.bg} ${priorityConfig.border}`}
      >
        <PriorityIcon className={`w-4 h-4 ${priorityConfig.iconColor}`} />
        <div>
          <div className={`text-sm font-semibold ${priorityConfig.text}`}>
            Mức ưu tiên: {priorityConfig.label}
          </div>
          <div className={`text-xs ${priorityConfig.text} opacity-80`}>
            {priorityConfig.description}
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="space-y-4">
        {actionCards.map((card) => {
          const CardIcon = card.icon;
          return (
            <div
              key={card.title}
              className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${card.bg} ${card.border}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                  <CardIcon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                <h4 className={`font-semibold ${card.titleColor}`}>
                  {card.label}
                </h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {card.advice || "Không có lời khuyên"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

