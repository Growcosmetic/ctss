"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ShoppingCart,
  Search,
  Sparkles,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import Section from "@/components/ui/Section";

interface QuickActionsBarProps {
  onCreateBooking?: () => void;
  onAddWalkIn?: () => void;
}

export default function QuickActionsBar({
  onCreateBooking,
  onAddWalkIn,
}: QuickActionsBarProps) {
  const router = useRouter();
  const { user } = useAuth();

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
      roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"],
    },
    {
      label: "Mở POS",
      icon: <ShoppingCart className="w-5 h-5" />,
      onClick: () => router.push("/pos"),
      color: "bg-green-600 hover:bg-green-700",
      roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
    },
    {
      label: "Tìm khách hàng",
      icon: <Search className="w-5 h-5" />,
      onClick: () => router.push("/crm?action=search"),
      color: "bg-purple-600 hover:bg-purple-700",
      roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST"],
    },
    {
      label: "Mina AI",
      icon: <Sparkles className="w-5 h-5" />,
      onClick: () => router.push("/mina"),
      color: "bg-pink-600 hover:bg-pink-700",
      roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"],
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
      roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
    },
    {
      label: "Báo cáo hôm nay",
      icon: <BarChart3 className="w-5 h-5" />,
      onClick: () => {
        const today = new Date().toISOString().split("T")[0];
        router.push(`/reports?date=${today}`);
      },
      color: "bg-indigo-600 hover:bg-indigo-700",
      roles: ["ADMIN", "MANAGER"],
    },
  ];

  // Filter actions by user role
  const visibleActions = actions.filter((action) => {
    if (!user) return false;
    return action.roles.includes(user.role as any);
  });

  const getVariant = (color: string): "primary" | "secondary" | "success" | "danger" | "outline" => {
    if (color.includes("blue")) return "primary";
    if (color.includes("green")) return "success";
    if (color.includes("purple") || color.includes("indigo") || color.includes("pink")) return "secondary";
    return "primary";
  };

  return (
    <Section title="Thao tác nhanh">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {visibleActions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            variant={getVariant(action.color)}
            className="p-4 flex flex-col items-center gap-2 h-auto shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
            aria-label={action.label}
          >
            {action.icon}
            <span className="text-sm font-medium text-center">{action.label}</span>
          </Button>
        ))}
      </div>
    </Section>
  );
}

