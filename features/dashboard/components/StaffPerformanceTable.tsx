"use client";

import React from "react";
import { StaffPerformance } from "../types";
import { formatCurrency } from "@/lib/utils";
import { User } from "lucide-react";

interface StaffPerformanceTableProps {
  performance: StaffPerformance[];
}

export default function StaffPerformanceTable({
  performance,
}: StaffPerformanceTableProps) {
  if (performance.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <p className="text-center text-gray-500">Không có dữ liệu nhân viên</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Hiệu suất nhân viên hôm nay</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lịch hẹn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đã hoàn thành
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doanh thu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mức độ bận
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {performance.map((staff) => (
              <tr key={staff.staffId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {staff.avatar ? (
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{staff.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {staff.bookingsToday}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {staff.completedBookings}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatCurrency(staff.revenueToday)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                      <div
                        className={`h-2 rounded-full ${
                          staff.workloadPercentage >= 80
                            ? "bg-red-500"
                            : staff.workloadPercentage >= 50
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(100, staff.workloadPercentage)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {staff.workloadPercentage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

