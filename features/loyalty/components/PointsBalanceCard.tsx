"use client";

import React from "react";
import { CustomerLoyalty } from "../types";
import { Coins, TrendingUp } from "lucide-react";

interface PointsBalanceCardProps {
  loyalty: CustomerLoyalty;
}

export default function PointsBalanceCard({
  loyalty,
}: PointsBalanceCardProps) {
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-600 rounded-lg">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Điểm tích lũy</h3>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-600 mb-1">Điểm hiện tại</div>
          <div className="text-3xl font-bold text-gray-900">
            {loyalty.totalPoints.toLocaleString("vi-VN")}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>Tổng điểm đã tích: {loyalty.lifetimePoints.toLocaleString("vi-VN")}</span>
        </div>
      </div>
    </div>
  );
}

