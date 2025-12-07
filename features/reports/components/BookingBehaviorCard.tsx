"use client";

import React from "react";
import { Users, UserPlus, UserX, Calendar } from "lucide-react";
import { BookingBehavior } from "../types";

interface BookingBehaviorCardProps {
  behavior: BookingBehavior | null;
  loading?: boolean;
}

export default function BookingBehaviorCard({
  behavior,
  loading,
}: BookingBehaviorCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!behavior) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500">Chưa có dữ liệu</p>
      </div>
    );
  }

  const totalCustomers = behavior.newCustomers + behavior.returningCustomers;
  const newCustomerPercentage =
    totalCustomers > 0 ? (behavior.newCustomers / totalCustomers) * 100 : 0;
  const returningCustomerPercentage =
    totalCustomers > 0 ? (behavior.returningCustomers / totalCustomers) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Hành vi đặt lịch
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* New Customers */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Khách mới</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{behavior.newCustomers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {newCustomerPercentage.toFixed(1)}% tổng số
          </p>
        </div>

        {/* Returning Customers */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Khách quay lại</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{behavior.returningCustomers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {returningCustomerPercentage.toFixed(1)}% tổng số
          </p>
        </div>

        {/* No Shows */}
        <div className="p-4 bg-red-50 rounded-lg col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-600">Không đến (No-show)</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{behavior.noShowCount}</p>
        </div>
      </div>

      {/* Booking by Day Summary */}
      {behavior.bookingByDay.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tổng số đặt lịch theo ngày</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {behavior.bookingByDay.slice(-7).map((day) => (
              <div key={day.date} className="text-center p-2 bg-gray-50 rounded">
                <div className="font-medium text-gray-900">{day.count}</div>
                <div className="text-gray-500">
                  {new Date(day.date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

