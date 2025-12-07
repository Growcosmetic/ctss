"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    damageLevel: "",
    curlType: "",
    goal: "",
    startDate: "",
    endDate: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stylist-analysis/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters)
      });
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error loading data:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">📘 Lịch sử phân tích kỹ thuật</h1>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        {/* SEARCH */}
        <Input
          placeholder="Tìm kiếm theo tình trạng tóc, mục tiêu, lịch sử hóa chất..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* DAMAGE LEVEL */}
          <Select
            value={filters.damageLevel}
            onChange={(e) => setFilters({ ...filters, damageLevel: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>

          {/* CURL TYPE */}
          <Input
            placeholder="Loại xoăn (Wavy 2B, C curl...)"
            value={filters.curlType}
            onChange={(e) => setFilters({ ...filters, curlType: e.target.value })}
          />

          {/* GOAL */}
          <Input
            placeholder="Mục tiêu khách"
            value={filters.goal}
            onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
          />
        </div>

        {/* DATE FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Từ ngày</label>
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Đến ngày</label>
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* LIST */}
      {loading && <div className="p-6">⏳ Đang tải...</div>}

      {items.length === 0 && !loading && (
        <div className="text-gray-600 p-6 text-center">Không có kết quả phù hợp</div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <Link key={item.id} href={`/stylist-coach/history/${item.id}`}>
            <Card className="p-4 hover:bg-gray-50 cursor-pointer border">
              <div className="flex justify-between">
                <div className="font-semibold text-gray-900">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>

              <div className="mt-1 text-sm text-gray-700">
                <span className="font-medium">Tóc: </span>
                {item.hairCondition}
              </div>

              <div className="mt-1 text-sm text-gray-700">
                <span className="font-medium">Mục tiêu: </span>
                {item.customerGoal}
              </div>

              <div className="mt-1 text-xs text-indigo-700">
                Xem chi tiết →
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

