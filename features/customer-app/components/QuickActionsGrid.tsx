"use client";

import React from "react";
import { Calendar, Gift, History, User, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActionsGrid() {
  const router = useRouter();

  const actions = [
    {
      label: "Đặt lịch",
      icon: Calendar,
      color: "from-pink-500 to-rose-500",
      href: "/customer-app/book",
    },
    {
      label: "Ưu đãi",
      icon: Gift,
      color: "from-purple-500 to-indigo-500",
      href: "/customer-app/promotions",
    },
    {
      label: "Lịch sử",
      icon: History,
      color: "from-blue-500 to-cyan-500",
      href: "/customer-app/bookings?status=history",
    },
    {
      label: "Cá nhân",
      icon: User,
      color: "from-green-500 to-emerald-500",
      href: "/customer-app/profile",
    },
    {
      label: "Gợi ý",
      icon: Sparkles,
      color: "from-orange-500 to-amber-500",
      href: "/customer-app/recommendations",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => router.push(action.href)}
          className={`bg-gradient-to-br ${action.color} text-white rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all transform hover:scale-105`}
        >
          <action.icon className="w-8 h-8" />
          <span className="font-semibold text-sm">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

