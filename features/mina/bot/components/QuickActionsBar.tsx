"use client";

import React from "react";
import { User, Calendar, TrendingUp, DollarSign, Clock, FileText } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CTSSRole } from "@/features/auth/types";

interface QuickAction {
  label: string;
  action: string;
  icon: React.ReactNode;
  roles: CTSSRole[];
}

const quickActions: QuickAction[] = [
  {
    label: "Xem hồ sơ khách",
    action: "customer_profile",
    icon: <User className="w-4 h-4" />,
    roles: [CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.RECEPTIONIST, CTSSRole.STYLIST],
  },
  {
    label: "Dự đoán quay lại",
    action: "predict_return",
    icon: <Clock className="w-4 h-4" />,
    roles: [CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.RECEPTIONIST, CTSSRole.STYLIST],
  },
  {
    label: "Gợi ý upsell",
    action: "upsell_suggestion",
    icon: <TrendingUp className="w-4 h-4" />,
    roles: [CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.RECEPTIONIST],
  },
  {
    label: "Xem lịch stylist",
    action: "stylist_schedule",
    icon: <Calendar className="w-4 h-4" />,
    roles: [CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.RECEPTIONIST, CTSSRole.STYLIST, CTSSRole.ASSISTANT],
  },
  {
    label: "Báo giá dịch vụ",
    action: "service_price",
    icon: <DollarSign className="w-4 h-4" />,
    roles: [CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.RECEPTIONIST],
  },
  {
    label: "Lịch sử hóa đơn",
    action: "invoice_history",
    icon: <FileText className="w-4 h-4" />,
    roles: [CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.RECEPTIONIST],
  },
];

interface QuickActionsBarProps {
  onActionClick: (action: string) => void;
}

export default function QuickActionsBar({ onActionClick }: QuickActionsBarProps) {
  const { user, hasAnyRole } = useAuth();

  // Filter actions based on user role
  const availableActions = quickActions.filter((action) =>
    hasAnyRole(action.roles)
  );

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-t border-gray-200">
      {availableActions.map((action) => (
        <button
          key={action.action}
          onClick={() => onActionClick(action.action)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm text-gray-700"
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

