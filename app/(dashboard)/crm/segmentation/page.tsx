"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SegmentationPage() {
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSegment || selectedTag) {
      loadCustomers();
    }
  }, [selectedSegment, selectedTag]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/segmentation/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segment: selectedSegment || undefined,
          tag: selectedTag || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Load customers error:", err);
    } finally {
      setLoading(false);
    }
  };

  const segments = [
    { id: "A", name: "Group A: VIP High Value", color: "bg-purple-50 border-purple-200" },
    { id: "B", name: "Group B: Ready-to-Return", color: "bg-green-50 border-green-200" },
    { id: "C", name: "Group C: Overdue (90-180 days)", color: "bg-orange-50 border-orange-200" },
    { id: "D", name: "Group D: Lost (180+ days)", color: "bg-red-50 border-red-200" },
    { id: "E", name: "Group E: High Risk Hair", color: "bg-red-50 border-red-200" },
    { id: "F", name: "Group F: Color Lovers", color: "bg-blue-50 border-blue-200" },
    { id: "G", name: "Group G: Curl Lovers", color: "bg-pink-50 border-pink-200" },
  ];

  const popularTags = [
    "VIP",
    "Active",
    "Overdue",
    "Lost",
    "Risky Hair",
    "Hay uốn",
    "Hay nhuộm",
    "High Value",
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🎯 CRM Segmentation</h1>
        <p className="text-gray-600">
          Phân nhóm khách hàng theo tags và hành vi
        </p>
      </div>

      {/* Segment Buttons */}
      <Card className="p-6 border">
        <h2 className="font-semibold text-lg mb-4">Phân nhóm (Segments)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {segments.map((seg) => (
            <button
              key={seg.id}
              onClick={() => {
                setSelectedSegment(selectedSegment === seg.id ? "" : seg.id);
                setSelectedTag("");
              }}
              className={`p-4 rounded-lg border text-left transition ${
                selectedSegment === seg.id
                  ? `${seg.color} border-2 border-blue-500`
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">{seg.name}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Popular Tags */}
      <Card className="p-6 border">
        <h2 className="font-semibold text-lg mb-4">Tags phổ biến</h2>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(selectedTag === tag ? "" : tag);
                setSelectedSegment("");
              }}
              className={`px-4 py-2 rounded-full border transition ${
                selectedTag === tag
                  ? "bg-blue-100 text-blue-700 border-blue-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">⏳ Đang tải...</div>
      ) : customers.length > 0 ? (
        <Card className="p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              Kết quả ({customers.length} khách hàng)
            </h2>
          </div>
          <div className="space-y-3">
            {customers.map((c) => (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-gray-600">
                      📱 {c.phone} • 💳 {c.totalSpent?.toLocaleString("vi-VN") || 0}₫ • 🗓{" "}
                      {c.totalVisits || 0} lần
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.tags?.slice(0, 3).map((t: any) => (
                      <span
                        key={t.id}
                        className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                      >
                        {t.tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      ) : (selectedSegment || selectedTag) ? (
        <Card className="p-8 border text-center text-gray-500">
          Không tìm thấy khách hàng nào
        </Card>
      ) : null}
    </div>
  );
}

