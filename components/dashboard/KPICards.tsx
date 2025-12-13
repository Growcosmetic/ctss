"use client";

import StatCard from "@/components/ui/StatCard";
import { Calendar, DollarSign, Users, UserCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KPICardsProps {
  stats: {
    bookingsToday?: number;
    bookingsThisMonth?: number;
    revenueToday?: number;
    invoicesToday?: number;
    newCustomers?: number;
    returningCustomers?: number;
    totalStaff?: number;
    activeStaff?: number;
  };
}

export default function KPICards({ stats }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Lịch hẹn */}
      <StatCard
        title="Lịch hẹn"
        value={stats.bookingsToday || 0}
        icon={Calendar}
        iconColor="#ffffff"
        iconBg="#f97316"
        trend={
          stats.bookingsThisMonth !== undefined
            ? {
                value: 0,
                isPositive: true,
                label: `${stats.bookingsThisMonth} Sắp tới tháng này`,
              }
            : undefined
        }
      />

      {/* Thu ngân */}
      <StatCard
        title="Doanh thu hôm nay"
        value={formatCurrency(stats.revenueToday || 0)}
        icon={DollarSign}
        iconColor="#ffffff"
        iconBg="#22c55e"
        trend={
          stats.invoicesToday !== undefined
            ? {
                value: 0,
                isPositive: true,
                label: `${stats.invoicesToday} Hóa đơn`,
              }
            : undefined
        }
      />

      {/* Khách hàng */}
      <StatCard
        title="Khách hàng"
        value={`${stats.newCustomers || 0} mới`}
        icon={Users}
        iconColor="#ffffff"
        iconBg="#f97316"
        trend={
          stats.returningCustomers !== undefined
            ? {
                value: 0,
                isPositive: true,
                label: `${stats.returningCustomers} Khách cũ`,
              }
            : undefined
        }
      />

      {/* Nhân viên */}
      {stats.totalStaff !== undefined && stats.activeStaff !== undefined && (
        <StatCard
          title="Nhân viên"
          value={`${stats.activeStaff}/${stats.totalStaff}`}
          icon={UserCircle}
          iconColor="#ffffff"
          iconBg="#3b82f6"
          trend={{
            value: 0,
            isPositive: true,
            label: "Đang làm việc",
          }}
        />
      )}
    </div>
  );
}
