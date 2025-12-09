"use client";

import React, { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, BarChart3, TrendingUp, Users, Calendar } from "lucide-react";

interface CustomerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
}

export default function CustomerStatsModal({
  isOpen,
  onClose,
  customers,
}: CustomerStatsModalProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Gender distribution
    const genderStats = {
      male: customers.filter((c) => c.gender === "MALE").length,
      female: customers.filter((c) => c.gender === "FEMALE").length,
      unknown: customers.filter((c) => !c.gender || (c.gender !== "MALE" && c.gender !== "FEMALE")).length,
    };

    // Rank distribution
    const rankStats = {
      normal: customers.filter((c) => {
        const rank = c.profile?.preferences?.rank || "Hạng Thường";
        return rank === "Hạng Thường";
      }).length,
      silver: customers.filter((c) => {
        const rank = c.profile?.preferences?.rank || "Hạng Thường";
        return rank === "Hạng Bạc";
      }).length,
      gold: customers.filter((c) => {
        const rank = c.profile?.preferences?.rank || "Hạng Thường";
        return rank === "Hạng Vàng";
      }).length,
      diamond: customers.filter((c) => {
        const rank = c.profile?.preferences?.rank || "Hạng Thường";
        return rank === "Hạng Kim Cương";
      }).length,
    };

    // Group distribution
    const groupMap = new Map<string, number>();
    customers.forEach((c) => {
      const group = c.profile?.preferences?.customerGroup || "Chưa phân nhóm";
      groupMap.set(group, (groupMap.get(group) || 0) + 1);
    });
    const groupStats = Array.from(groupMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // New customers this week/month
    const newThisWeek = customers.filter((c) => {
      const created = new Date(c.createdAt);
      return created >= thisWeek;
    }).length;

    const newThisMonth = customers.filter((c) => {
      const created = new Date(c.createdAt);
      return created >= thisMonth;
    }).length;

    // Birthdays this month
    const birthdaysThisMonth = customers.filter((c) => {
      if (!c.birthday && !c.dateOfBirth) return false;
      const dob = new Date(c.birthday || c.dateOfBirth);
      return dob.getMonth() === now.getMonth();
    }).length;

    // Total revenue
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const avgSpent = customers.length > 0 ? totalRevenue / customers.length : 0;

    return {
      total: customers.length,
      newThisWeek,
      newThisMonth,
      birthdaysThisMonth,
      genderStats,
      rankStats,
      groupStats,
      totalRevenue,
      avgSpent,
    };
  }, [customers]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thống kê khách hàng"
      size="xl"
      footer={
        <div className="flex items-center justify-end">
          <Button variant="destructive" onClick={onClose}>
            <X size={18} className="mr-2" />
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-blue-600" size={20} />
              <p className="text-sm text-gray-600">Tổng số khách hàng</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600" size={20} />
              <p className="text-sm text-gray-600">Khách mới tuần này</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.newThisWeek}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-purple-600" size={20} />
              <p className="text-sm text-gray-600">Sinh nhật tháng này</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.birthdaysThisMonth}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="text-orange-600" size={20} />
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalRevenue.toLocaleString()} ₫
            </p>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Giới tính</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Nữ</span>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.genderStats.female / stats.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {stats.genderStats.female}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Nam</span>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.genderStats.male / stats.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {stats.genderStats.male}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rank Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xếp hạng khách hàng</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Hạng Thường</span>
              <span className="text-sm font-medium text-gray-900">{stats.rankStats.normal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Hạng Bạc</span>
              <span className="text-sm font-medium text-gray-900">{stats.rankStats.silver}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Hạng Vàng</span>
              <span className="text-sm font-medium text-gray-900">{stats.rankStats.gold}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Hạng Kim Cương</span>
              <span className="text-sm font-medium text-gray-900">{stats.rankStats.diamond}</span>
            </div>
          </div>
        </div>

        {/* Group Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân nhóm khách hàng</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stats.groupStats.map((group, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 truncate flex-1">{group.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(group.count / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {group.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

