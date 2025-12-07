"use client";

import React from "react";
import { Scissors } from "lucide-react";
import { ServiceReport } from "../types";

interface TopServicesTableProps {
  services: ServiceReport[];
  loading?: boolean;
}

export default function TopServicesTable({
  services,
  loading,
}: TopServicesTableProps) {
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

  if (services.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Scissors className="w-5 h-5" />
          Top dịch vụ
        </h3>
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Scissors className="w-5 h-5" />
        Top dịch vụ
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Dịch vụ</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Số lần</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">
                Doanh thu
              </th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">
                Giá TB
              </th>
            </tr>
          </thead>
          <tbody>
            {services.slice(0, 10).map((service, index) => (
              <tr key={service.serviceId} className="border-b hover:bg-gray-50">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{service.serviceName}</span>
                  </div>
                </td>
                <td className="text-right py-3 px-3 text-gray-700">{service.count}</td>
                <td className="text-right py-3 px-3 font-semibold text-green-600">
                  {service.totalRevenue.toLocaleString("vi-VN")} đ
                </td>
                <td className="text-right py-3 px-3 text-gray-600">
                  {service.averagePrice.toLocaleString("vi-VN")} đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

