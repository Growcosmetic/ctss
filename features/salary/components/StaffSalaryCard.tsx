"use client";

import React, { useState } from "react";
import { DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { SalaryPayout } from "../types";
import SalaryBreakdownModal from "./SalaryBreakdownModal";

interface StaffSalaryCardProps {
  payout: SalaryPayout;
}

export default function StaffSalaryCard({ payout }: StaffSalaryCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const staffName = payout.staff ? payout.staff.name : "Unknown";

  return (
    <>
      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{staffName}</h3>
            <p className="text-sm text-gray-600">
              Tháng {payout.month} • {payout.staff?.phone || "N/A"}
            </p>
          </div>
          <div className="text-right mr-4">
            <p className="text-sm text-gray-600">Tổng lương</p>
            <p className="text-2xl font-bold text-green-600">
              {payout.totalSalary.toLocaleString("vi-VN")} VND
            </p>
          </div>
          <button
            onClick={() => setShowBreakdown(true)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
          >
            Chi tiết
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Lương cơ bản</p>
            <p className="font-medium">{payout.breakdown.baseSalary.toLocaleString("vi-VN")} VND</p>
          </div>
          <div>
            <p className="text-gray-600">Hoa hồng</p>
            <p className="font-medium">
              {payout.breakdown.commissions.total.toLocaleString("vi-VN")} VND
            </p>
          </div>
          <div>
            <p className="text-gray-600">Bonus</p>
            <p className="font-medium">{payout.breakdown.bonuses.total.toLocaleString("vi-VN")} VND</p>
          </div>
          <div>
            <p className="text-gray-600">Phạt</p>
            <p className="font-medium text-red-600">
              {payout.breakdown.deductions.total.toLocaleString("vi-VN")} VND
            </p>
          </div>
        </div>
      </div>

      {showBreakdown && (
        <SalaryBreakdownModal
          payout={payout}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </>
  );
}

