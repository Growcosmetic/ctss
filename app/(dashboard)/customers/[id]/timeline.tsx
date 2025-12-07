"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import VisitDetailModal from "./VisitDetailModal";

export default function CustomerTimeline({ customerId }: { customerId: string }) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    service: "",
    stylist: "",
    assistant: "",
    notes: "",
    rating: null,
    technical: null,
    productsUsed: null,
    totalCharge: null,
    photosBefore: [],
    photosAfter: [],
  });

  useEffect(() => {
    loadTimeline();
  }, [customerId]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/visits/getByCustomer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      const data = await res.json();
      if (data.success) {
        setTimeline(data.visits || []);
      }
    } catch (err) {
      console.error("Load timeline error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisit = async () => {
    try {
      const res = await fetch("/api/visits/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          service: formData.service,
          stylist: formData.stylist || null,
          assistant: formData.assistant || null,
          notes: formData.notes || null,
          rating: formData.rating || null,
          date: new Date().toISOString(),
        }),
      });

      const result = await res.json();
      if (result.success) {
        setAdding(false);
        setFormData({
          service: "",
          stylist: "",
          assistant: "",
          notes: "",
          rating: null,
        });
        loadTimeline(); // Reload timeline
        alert("Đã thêm dịch vụ thành công!");
      }
    } catch (err) {
      console.error("Add visit error:", err);
      alert("Có lỗi xảy ra khi thêm dịch vụ");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">⏳ Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add Visit Button */}
      <div className="flex justify-end">
        <Button onClick={() => setAdding(!adding)}>
          {adding ? "Hủy" : "+ Thêm dịch vụ"}
        </Button>
      </div>

      {/* Add Visit Form */}
      {adding && (
        <Card className="p-6 border bg-blue-50">
          <h3 className="font-semibold mb-4">Thêm dịch vụ mới</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Dịch vụ *</label>
              <Input
                value={formData.service}
                onChange={(e) =>
                  setFormData({ ...formData, service: e.target.value })
                }
                placeholder="Ví dụ: Uốn nóng - Nhuộm màu"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Stylist</label>
                <Input
                  value={formData.stylist}
                  onChange={(e) =>
                    setFormData({ ...formData, stylist: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Assistant</label>
                <Input
                  value={formData.assistant}
                  onChange={(e) =>
                    setFormData({ ...formData, assistant: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Đánh giá (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.rating || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="mt-1"
              />
            </div>
            <Button onClick={handleAddVisit} className="w-full">
              💾 Lưu dịch vụ
            </Button>
          </div>
        </Card>
      )}

      {/* Timeline */}
      {timeline.length === 0 ? (
        <Card className="p-8 border text-center text-gray-500">
          Chưa có dịch vụ nào
        </Card>
      ) : (
        <div className="space-y-4">
          {timeline.map((visit: any) => (
            <Card
              key={visit.id}
              className="p-6 border rounded-xl bg-white hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-xl font-semibold text-gray-900 mb-1">
                    {visit.service}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    📅 {new Date(visit.date).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {(visit.stylist || visit.assistant) && (
                    <div className="text-sm text-gray-600 mb-2">
                      {visit.stylist && <span>💇 Stylist: {visit.stylist}</span>}
                      {visit.stylist && visit.assistant && " • "}
                      {visit.assistant && (
                        <span>🧪 Assistant: {visit.assistant}</span>
                      )}
                    </div>
                  )}
                </div>
                {visit.rating && (
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    ⭐ {visit.rating}/5
                  </div>
                )}
              </div>

              {/* Notes */}
              {visit.notes && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border text-sm text-gray-700">
                  {visit.notes}
                </div>
              )}

              {/* Products Used */}
              {visit.productsUsed && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    🧴 Sản phẩm đã dùng:
                  </div>
                  <div className="text-sm text-gray-600 pl-4">
                    {Array.isArray(visit.productsUsed) ? (
                      <ul className="list-disc">
                        {visit.productsUsed.map((p: any, i: number) => (
                          <li key={i}>
                            {p.name} - {p.amount}g
                          </li>
                        ))}
                      </ul>
                    ) : (
                      JSON.stringify(visit.productsUsed)
                    )}
                  </div>
                </div>
              )}

              {/* Photos */}
              {(visit.photosBefore?.length > 0 ||
                visit.photosAfter?.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {visit.photosBefore?.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        📷 Before
                      </div>
                      <div className="space-y-2">
                        {visit.photosBefore.map((url: string, i: number) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Before ${i + 1}`}
                            className="w-full rounded-lg border object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {visit.photosAfter?.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        📷 After
                      </div>
                      <div className="space-y-2">
                        {visit.photosAfter.map((url: string, i: number) => (
                          <img
                            key={i}
                            src={url}
                            alt={`After ${i + 1}`}
                            className="w-full rounded-lg border object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up Notes */}
              {visit.followUpNotes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700">
                  <div className="font-medium text-blue-700 mb-1">
                    📞 Follow-up:
                  </div>
                  {visit.followUpNotes}
                </div>
              )}

              {/* Tags */}
              {visit.tags && visit.tags.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {visit.tags.map((tag: string, i: number) => {
                    const tagColors: Record<string, string> = {
                      VIP: "bg-purple-100 text-purple-700",
                      Risky: "bg-red-100 text-red-700",
                      Overdue: "bg-orange-100 text-orange-700",
                      Loyal: "bg-green-100 text-green-700",
                      Premium: "bg-blue-100 text-blue-700",
                    };
                    return (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tagColors[tag] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* View Detail Button */}
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={() => setSelectedVisit(visit)}
                  variant="outline"
                  className="text-sm"
                >
                  📋 Xem chi tiết
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Visit Detail Modal */}
      {selectedVisit && (
        <VisitDetailModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
        />
      )}
    </div>
  );
}

