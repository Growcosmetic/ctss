"use client";

import React from "react";
import KpiCard from "./KpiCard";
import {
  DollarSign,
  TrendingUp,
  UserPlus,
  Users,
  Receipt,
  ArrowUpRight,
} from "lucide-react";

interface KpiGridProps {
  stats: {
    revenueToday: number;
    profitToday: number;
    newCustomers: number;
    returningCustomers: number;
    avgTicket: number;
    upsellRate: number;
  };
}

export default function KpiGrid({ stats }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <KpiCard
        title="Revenue Today"
        value={stats.revenueToday}
        icon={DollarSign}
        format="currency"
        trend={{ value: 12.5, isPositive: true }}
      />
      <KpiCard
        title="Profit Today"
        value={stats.profitToday}
        icon={TrendingUp}
        format="currency"
        trend={{ value: 8.3, isPositive: true }}
      />
      <KpiCard
        title="New Customers"
        value={stats.newCustomers}
        icon={UserPlus}
        format="number"
        trend={{ value: 15.2, isPositive: true }}
      />
      <KpiCard
        title="Returning Customers"
        value={stats.returningCustomers}
        icon={Users}
        format="number"
        trend={{ value: -2.1, isPositive: false }}
      />
      <KpiCard
        title="Avg Ticket"
        value={stats.avgTicket}
        icon={Receipt}
        format="currency"
        trend={{ value: 5.7, isPositive: true }}
      />
      <KpiCard
        title="Upsell Rate"
        value={stats.upsellRate}
        icon={ArrowUpRight}
        format="percent"
        trend={{ value: 3.4, isPositive: true }}
      />
    </div>
  );
}
