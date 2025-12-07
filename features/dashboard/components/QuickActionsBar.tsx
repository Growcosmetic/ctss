"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ShoppingCart,
  Search,
  Sparkles,
  UserPlus,
} from "lucide-react";

interface QuickActionsBarProps {
  onCreateBooking?: () => void;
  onAddWalkIn?: () => void;
}

export default function QuickActionsBar({
  onCreateBooking,
  onAddWalkIn,
}: QuickActionsBarProps) {
  const router = useRouter();

  const actions = [
    {
      label: "Tạo lịch hẹn",
      icon: <Calendar className="w-5 h-5" />,
      onClick: () => {
        if (onCreateBooking) {
          onCreateBooking();
        } else {
          router.push("/booking?action=create");
        }
      },
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Mở POS",
      icon: <ShoppingCart className="w-5 h-5" />,
      onClick: () => router.push("/pos"),
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Tìm khách hàng",
      icon: <Search className="w-5 h-5" />,
      onClick: () => router.push("/crm?action=search"),
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      label: "Mina AI",
      icon: <Sparkles className="w-5 h-5" />,
      onClick: () => router.push("/mina"),
      color: "bg-pink-600 hover:bg-pink-700",
    },
    {
      label: "Khách vãng lai",
      icon: <UserPlus className="w-5 h-5" />,
      onClick: () => {
        if (onAddWalkIn) {
          onAddWalkIn();
        } else {
          router.push("/booking?action=walkin");
        }
      },
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-colors shadow-sm hover:shadow-md`}
          >
            {action.icon}
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

