"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function WorkflowConsolePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workflow/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      const data = await res.json();
      setItems(data || []);
    } catch (error) {
      console.error("Error loading workflows:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getWorkflowTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "stylist-coach": "Stylist Coach",
      "booking-optimizer": "Booking Optimizer",
      "sop-assistant": "SOP Assistant",
      "customer-insight": "Customer Insight",
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🧠 Workflow Console</h1>

      {/* FILTER */}
      <Card className="p-4 space-y-4 border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="stylist-coach">Stylist Coach</option>
            <option value="booking-optimizer">Booking Optimizer</option>
            <option value="sop-assistant">SOP Assistant</option>
            <option value="customer-insight">Customer Insight</option>
          </Select>

          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            placeholder="Từ ngày"
          />

          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            placeholder="Đến ngày"
          />
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-black text-white rounded-lg mt-2 hover:bg-gray-800 transition-colors"
        >
          Lọc
        </button>
      </Card>

      {/* LIST */}
      {loading && <div className="text-center py-8">⏳ Đang tải...</div>}

      {!loading && items.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          Không có workflow nào
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <Link key={item.id} href={`/workflow-console/${item.id}`}>
            <Card className="p-4 hover:bg-gray-50 cursor-pointer border space-y-1 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-lg text-gray-900">
                    {getWorkflowTypeLabel(item.type)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ID: {item.id}
                  </div>
                </div>
                <div className="text-sm text-gray-600 whitespace-nowrap ml-4">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="text-xs text-indigo-600 mt-2">
                Xem chi tiết →
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

