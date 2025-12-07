"use client";

import React from "react";
import { X } from "lucide-react";
import { SalaryPayout } from "../types";

interface SalaryBreakdownModalProps {
  payout: SalaryPayout;
  onClose: () => void;
}

export default function SalaryBreakdownModal({
  payout,
  onClose,
}: SalaryBreakdownModalProps) {
  const breakdown = payout.breakdown;
  const staffName = payout.staff ? payout.staff.name : "Unknown";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Chi tiết lương - {staffName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Base Salary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Lương cơ bản</h3>
            <p className="text-lg">{breakdown.baseSalary.toLocaleString("vi-VN")} VND</p>
          </div>

          {/* Commissions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Hoa hồng</h3>
            <div className="pl-4 space-y-1">
              <p className="text-gray-700">
                Dịch vụ: {breakdown.commissions.service.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-gray-700">
                Sản phẩm: {breakdown.commissions.product.toLocaleString("vi-VN")} VND
              </p>
              <p className="font-medium text-gray-900">
                Tổng: {breakdown.commissions.total.toLocaleString("vi-VN")} VND
              </p>
            </div>
          </div>

          {/* Bonuses */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Thưởng</h3>
            <div className="pl-4 space-y-1">
              <p className="text-gray-700">
                KPI: {breakdown.bonuses.kpi.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-gray-700">
                Tăng ca: {breakdown.bonuses.overtime.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-gray-700">
                Tips: {breakdown.bonuses.tips.toLocaleString("vi-VN")} VND
              </p>
              <p className="font-medium text-gray-900">
                Tổng: {breakdown.bonuses.total.toLocaleString("vi-VN")} VND
              </p>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="font-semibold text-red-600 mb-2">Khấu trừ</h3>
            <div className="pl-4 space-y-1">
              <p className="text-gray-700">
                Đi muộn: {breakdown.deductions.late.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-gray-700">
                Vắng mặt: {breakdown.deductions.absent.toLocaleString("vi-VN")} VND
              </p>
              <p className="font-medium text-red-600">
                Tổng: {breakdown.deductions.total.toLocaleString("vi-VN")} VND
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Tổng thu:</span>
              <span className="text-lg font-bold text-green-600">
                {breakdown.summary.gross.toLocaleString("vi-VN")} VND
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Tổng trừ:</span>
              <span className="text-lg font-bold text-red-600">
                {breakdown.summary.deductions.toLocaleString("vi-VN")} VND
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="text-xl font-bold text-gray-900">Thực nhận:</span>
              <span className="text-2xl font-bold text-green-600">
                {breakdown.summary.net.toLocaleString("vi-VN")} VND
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

