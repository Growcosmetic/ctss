"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const roleLabels: Record<string, string> = {
  receptionist: "Lễ tân",
  stylist: "Stylist",
  assistant: "Phụ việc",
  online: "CSKH Online",
  all: "Tất cả",
};

export default function SOPPage() {
  const [role, setRole] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (r = "") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/sop/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: r }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load SOPs");
      }

      setList(data.sops || []);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    load(newRole);
  };

  if (loading && list.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải SOP...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🧭 SOP Master System</h1>
        <p className="text-gray-600">
          Quy trình vận hành chuẩn - Chí Tâm Hair Salon
        </p>
      </div>

      <Card className="p-6 border space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Lọc theo bộ phận
          </label>
          <Select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
            <option value="">Tất cả bộ phận</option>
            <option value="receptionist">Lễ tân</option>
            <option value="stylist">Stylist</option>
            <option value="assistant">Phụ việc</option>
            <option value="online">CSKH Online</option>
            <option value="all">Tất cả</option>
          </Select>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border bg-red-50">
          <div className="text-red-600 text-sm">{error}</div>
          <Button onClick={() => load(role)} variant="outline" size="sm" className="mt-2">
            Thử lại
          </Button>
        </Card>
      )}

      {list.length === 0 && !loading ? (
        <Card className="p-6 border text-center">
          <div className="text-gray-500">
            Chưa có SOP nào{role ? ` cho bộ phận ${roleLabels[role] || role}` : ""}. Vui lòng thêm SOP để bắt đầu.
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((s: any) => {
            const detail = typeof s.detail === "string" ? JSON.parse(s.detail) : s.detail;

            return (
              <Card
                key={s.id}
                className="p-6 bg-white border space-y-4 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-indigo-600">
                        {s.step}
                      </span>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {detail.title || s.title}
                      </h2>
                    </div>
                    <div className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full inline-block">
                      {roleLabels[s.role] || s.role}
                    </div>
                  </div>
                </div>

                {detail.purpose && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-semibold text-blue-700 mb-1">
                      📋 Mục đích:
                    </div>
                    <div className="text-sm text-gray-700">{detail.purpose}</div>
                  </div>
                )}

                {detail.steps && Array.isArray(detail.steps) && detail.steps.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-3">
                      📝 Các bước thực hiện:
                    </div>
                    <div className="space-y-2">
                      {detail.steps.map((step: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 border rounded-lg flex items-start gap-3"
                        >
                          <span className="font-semibold text-indigo-600">
                            {step.stepNumber || idx + 1}.
                          </span>
                          <div className="flex-1">
                            <div className="text-sm text-gray-800">{step.description}</div>
                            {step.estimatedTime && (
                              <div className="text-xs text-gray-500 mt-1">
                                ⏱ {step.estimatedTime}
                              </div>
                            )}
                            {step.important && (
                              <span className="text-xs text-red-600 font-semibold ml-2">
                                ⚠️ Quan trọng
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail.checklist && Array.isArray(detail.checklist) && detail.checklist.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-3">
                      ✅ Checklist:
                    </div>
                    <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                      {detail.checklist.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {detail.commonMistakes &&
                  Array.isArray(detail.commonMistakes) &&
                  detail.commonMistakes.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-red-700 mb-3">
                        ⚠️ Lỗi thường gặp:
                      </div>
                      <div className="space-y-2">
                        {detail.commonMistakes.map((mistake: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
                          >
                            <div className="font-medium text-red-800 mb-1">
                              ❌ {typeof mistake === "string" ? mistake : mistake.mistake}
                            </div>
                            {typeof mistake === "object" && mistake.prevention && (
                              <div className="text-gray-700 text-xs mt-1">
                                💡 Cách tránh: {mistake.prevention}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {detail.qualityStandards &&
                  Array.isArray(detail.qualityStandards) &&
                  detail.qualityStandards.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-green-700 mb-3">
                        ✨ Tiêu chuẩn chất lượng:
                      </div>
                      <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                        {detail.qualityStandards.map((standard: string, idx: number) => (
                          <li key={idx}>{standard}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {detail.notes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm font-semibold text-amber-700 mb-1">
                      📌 Ghi chú:
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {detail.notes}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {list.length > 0 && (
        <Card className="p-4 border bg-blue-50">
          <div className="text-sm text-blue-700">
            ✅ Hiển thị <strong>{list.length}</strong> SOP
            {role ? ` cho bộ phận ${roleLabels[role] || role}` : ""}
          </div>
        </Card>
      )}
    </div>
  );
}

