"use client";

import React from "react";
import { TrendingUp, Target, Award } from "lucide-react";
import { KPISummary } from "../types";

interface KPISummaryCardProps {
  kpi: KPISummary;
}

export default function KPISummaryCard({ kpi }: KPISummaryCardProps) {
  const score = kpi.score;
  const scoreColor =
    score >= 100 ? "text-green-600" : score >= 80 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          KPI Tháng {kpi.month}
        </h3>
        <div className={`text-2xl font-bold ${scoreColor}`}>
          {score}/100
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Doanh thu</p>
          <p className="text-lg font-semibold text-gray-900">
            {kpi.revenue.toLocaleString("vi-VN")} VND
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Số dịch vụ</p>
          <p className="text-lg font-semibold text-gray-900">{kpi.serviceCount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Bán sản phẩm</p>
          <p className="text-lg font-semibold text-gray-900">
            {kpi.productSales.toLocaleString("vi-VN")} VND
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

