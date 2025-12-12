"use client";

import { Card } from "@/components/ui/Card";
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
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-500 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Lịch hẹn</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.bookingsToday || 0}
          </p>
          <p className="text-sm text-gray-500">
            Sắp tới hôm nay
          </p>
          {stats.bookingsThisMonth !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              {stats.bookingsThisMonth} Sắp tới tháng này
            </p>
          )}
        </div>
      </Card>

      {/* Thu ngân */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-500 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Thu ngân</p>
          {stats.invoicesToday !== undefined && (
            <p className="text-2xl font-bold text-gray-900">
              {stats.invoicesToday} Hóa đơn hôm nay
            </p>
          )}
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(stats.revenueToday || 0)}
          </p>
          <p className="text-sm text-gray-500">Doanh thu hôm nay</p>
        </div>
      </Card>

      {/* Khách hàng */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-500 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Khách hàng</p>
          {stats.newCustomers !== undefined && (
            <p className="text-2xl font-bold text-gray-900">
              {stats.newCustomers} Khách mới hôm qua
            </p>
          )}
          {stats.returningCustomers !== undefined && (
            <p className="text-lg font-semibold text-gray-900">
              {stats.returningCustomers} Khách cũ hôm qua
            </p>
          )}
        </div>
      </Card>

      {/* Nhân viên */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <UserCircle className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Nhân viên</p>
          {stats.totalStaff !== undefined && stats.activeStaff !== undefined && (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeStaff}/{stats.totalStaff}
              </p>
              <p className="text-sm text-gray-500">Đang làm việc</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
