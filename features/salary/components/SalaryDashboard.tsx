"use client";

import React, { useEffect, useState } from "react";
import { useBranch } from "@/features/branches/hooks/useBranch";
import { format } from "date-fns";
import { DollarSign, Users, TrendingUp, Loader2 } from "lucide-react";
import StaffSalaryCard from "./StaffSalaryCard";
import KPISummaryCard from "./KPISummaryCard";

export default function SalaryDashboard() {
  const { currentBranch } = useBranch();
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBranch?.id) {
      loadSalaries();
    }
  }, [currentBranch, month]);

  const loadSalaries = async () => {
    if (!currentBranch?.id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/salary/generate?branchId=${currentBranch.id}&month=${month}`
      );
      if (response.ok) {
        const data = await response.json();
        setPayouts(data.data || []);
      }
    } catch (error) {
      console.error("Error loading salaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSalary = payouts.reduce((sum, p) => sum + Number(p.totalSalary), 0);
  const totalStaff = payouts.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Quản lý lương
              </h1>
              {currentBranch && (
                <p className="text-sm text-gray-600 mt-1">
                  Chi nhánh: {currentBranch.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={loadSalaries}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tính lương
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng nhân viên</p>
                <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng lương</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSalary.toLocaleString("vi-VN")} VND
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Lương trung bình</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalStaff > 0
                    ? (totalSalary / totalStaff).toLocaleString("vi-VN")
                    : 0}{" "}
                  VND
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Salary List */}
        <div className="space-y-4">
          {payouts.map((payout) => (
            <StaffSalaryCard key={payout.id} payout={payout} />
          ))}
        </div>
      </div>
    </div>
  );
}

