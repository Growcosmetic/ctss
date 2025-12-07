"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sent" | "pending">("all");

  useEffect(() => {
    loadReminders();
  }, [filter]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "sent") params.append("sent", "true");
      if (filter === "pending") params.append("sent", "false");

      const res = await fetch(`/api/reminders/process?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReminders(data.reminders || []);
      }
    } catch (err) {
      console.error("Load reminders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReminders = async () => {
    try {
      const res = await fetch("/api/reminders/process", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadReminders();
      }
    } catch (err) {
      console.error("Process reminders error:", err);
      alert("Có lỗi xảy ra khi xử lý reminders");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  const pendingCount = reminders.filter((r) => !r.sent).length;
  const sentCount = reminders.filter((r) => r.sent).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">📨 Reminder Queue</h1>
          <p className="text-gray-600">
            Hệ thống nhắc lịch tự động cho khách hàng
          </p>
        </div>
        <Button onClick={handleProcessReminders}>
          ⚡ Xử lý Reminders Đã Đến Hạn
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border bg-blue-50">
          <div className="text-sm text-gray-600 mb-1">Tổng số</div>
          <div className="text-2xl font-bold text-blue-700">
            {reminders.length}
          </div>
        </Card>
        <Card className="p-4 border bg-green-50">
          <div className="text-sm text-gray-600 mb-1">Đã gửi</div>
          <div className="text-2xl font-bold text-green-700">{sentCount}</div>
        </Card>
        <Card className="p-4 border bg-orange-50">
          <div className="text-sm text-gray-600 mb-1">Chờ gửi</div>
          <div className="text-2xl font-bold text-orange-700">
            {pendingCount}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg ${
              filter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Chờ gửi ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("sent")}
            className={`px-4 py-2 rounded-lg ${
              filter === "sent"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Đã gửi ({sentCount})
          </button>
        </div>
      </Card>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <Card className="p-8 border text-center text-gray-500">
          Không có reminders nào
        </Card>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => {
            const typeColors: Record<string, string> = {
              followup: "bg-blue-50 border-blue-200",
              rebook_curl: "bg-pink-50 border-pink-200",
              recolor: "bg-purple-50 border-purple-200",
              appointment: "bg-green-50 border-green-200",
              recovery: "bg-yellow-50 border-yellow-200",
              overdue: "bg-red-50 border-red-200",
            };

            return (
              <Card
                key={reminder.id}
                className={`p-6 border rounded-xl ${
                  typeColors[reminder.type] || "bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium border">
                        {reminder.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        📱 {reminder.channel}
                      </span>
                      {reminder.customer && (
                        <Link
                          href={`/customers/${reminder.customer.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          👤 {reminder.customer.name}
                        </Link>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      ⏰ Gửi lúc:{" "}
                      {new Date(reminder.sendAt).toLocaleString("vi-VN")}
                      {reminder.sentAt && (
                        <span className="ml-2">
                          • Đã gửi:{" "}
                          {new Date(reminder.sentAt).toLocaleString("vi-VN")}
                        </span>
                      )}
                    </div>
                    <div className="p-3 bg-white rounded-lg border text-sm text-gray-700 whitespace-pre-line">
                      {reminder.message}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reminder.sent
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {reminder.sent ? "✅ Đã gửi" : "⏳ Chờ gửi"}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

