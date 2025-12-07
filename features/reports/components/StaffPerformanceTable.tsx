"use client";

import React from "react";
import { User } from "lucide-react";
import { StaffReport } from "../types";

interface StaffPerformanceTableProps {
  staff: StaffReport[];
  loading?: boolean;
}

export default function StaffPerformanceTable({
  staff,
  loading,
}: StaffPerformanceTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Hiệu suất nhân viên
        </h3>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Hiệu suất nhân viên
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Nhân viên</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">
                Doanh thu
              </th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">
                Số khách
              </th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">
                Giá TB/khách
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, index) => (
              <tr key={s.staffId} className="border-b hover:bg-gray-50">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{s.staffName}</span>
                  </div>
                </td>
                <td className="text-right py-3 px-3 font-semibold text-green-600">
                  {s.totalRevenue.toLocaleString("vi-VN")} đ
                </td>
                <td className="text-right py-3 px-3 text-gray-700">{s.customersServed}</td>
                <td className="text-right py-3 px-3 text-gray-600">
                  {s.avgTicket.toLocaleString("vi-VN")} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

