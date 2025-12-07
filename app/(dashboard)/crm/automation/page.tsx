"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AutomationFlow {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  conditions: any;
  actions: any[];
  active: boolean;
  _count?: { logs: number };
}

export default function AutomationPage() {
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    trigger: "visit",
    conditions: {},
    actions: [],
    active: true,
  });

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/automation/flow/list");
      const data = await res.json();
      if (data.success) {
        setFlows(data.flows || []);
      }
    } catch (err) {
      console.error("Load flows error:", err);
    } finally {
      setLoading(false);
    }
  };

  const initExamples = async () => {
    try {
      const res = await fetch("/api/automation/flow/init-examples", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã tạo example flows thành công!");
        loadFlows();
      }
    } catch (err) {
      console.error("Init examples error:", err);
      alert("Có lỗi xảy ra");
    }
  };

  const toggleFlow = async (flowId: string, active: boolean) => {
    try {
      const res = await fetch("/api/automation/flow/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: flowId, active: !active }),
      });
      const data = await res.json();
      if (data.success) {
        loadFlows();
      }
    } catch (err) {
      console.error("Toggle flow error:", err);
    }
  };

  const deleteFlow = async (flowId: string) => {
    if (!confirm("Bạn có chắc muốn xóa flow này?")) return;

    try {
      const res = await fetch("/api/automation/flow/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: flowId }),
      });
      const data = await res.json();
      if (data.success) {
        loadFlows();
      }
    } catch (err) {
      console.error("Delete flow error:", err);
    }
  };

  const handleCreateFlow = async () => {
    try {
      const res = await fetch("/api/automation/flow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã tạo flow thành công!");
        setShowCreateForm(false);
        setFormData({
          name: "",
          description: "",
          trigger: "visit",
          conditions: {},
          actions: [],
          active: true,
        });
        loadFlows();
      } else {
        alert("Có lỗi: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Create flow error:", err);
      alert("Có lỗi xảy ra");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  const triggerNames: Record<string, string> = {
    visit: "Sau khi làm dịch vụ",
    time: "Theo thời gian",
    tag: "Theo tag",
    ai: "Theo AI Insight",
    event: "Theo sự kiện",
    manual: "Chạy tay",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">🤖 CRM Automation Engine</h1>
          <p className="text-gray-600">
            Tự động chăm sóc khách hàng 24/7 với automation flows
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={initExamples} variant="outline">
            📋 Tạo Example Flows
          </Button>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600"
          >
            + Tạo Flow Mới
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="p-6 border bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Tạo Automation Flow Mới</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tên Flow *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: Follow-up sau khi làm dịch vụ"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Mô tả flow này làm gì..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Trigger *</label>
              <select
                value={formData.trigger}
                onChange={(e) =>
                  setFormData({ ...formData, trigger: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option value="visit">Sau khi làm dịch vụ</option>
                <option value="time">Theo thời gian</option>
                <option value="tag">Theo tag</option>
                <option value="ai">Theo AI Insight</option>
                <option value="event">Theo sự kiện</option>
                <option value="manual">Chạy tay</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 p-3 bg-white rounded border">
              💡 <strong>Lưu ý:</strong> Flow mới tạo cần được cấu hình conditions và actions
              chi tiết. Bạn có thể dùng "Tạo Example Flows" để xem các flow mẫu hoặc cập nhật
              flow sau khi tạo.
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateFlow} className="bg-blue-600">
                💾 Tạo Flow
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Hủy
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Flows List */}
      {flows.length === 0 ? (
        <Card className="p-8 border text-center">
          <div className="text-gray-500 mb-4">
            Chưa có automation flow nào. Click "Tạo Example Flows" để bắt đầu.
          </div>
          <Button onClick={initExamples}>📋 Tạo Example Flows</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {flows.map((flow) => (
            <Card key={flow.id} className="p-6 border rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{flow.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        flow.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {flow.active ? "✅ Active" : "⏸️ Inactive"}
                    </span>
                  </div>
                  {flow.description && (
                    <p className="text-gray-600 mb-2">{flow.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Trigger: {triggerNames[flow.trigger] || flow.trigger}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {flow.actions?.length || 0} Actions
                    </span>
                    {flow._count && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {flow._count.logs} Logs
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleFlow(flow.id, flow.active)}
                    variant="outline"
                    size="sm"
                  >
                    {flow.active ? "⏸️ Tắt" : "▶️ Bật"}
                  </Button>
                  <Button
                    onClick={() => deleteFlow(flow.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    🗑️ Xóa
                  </Button>
                </div>
              </div>

              {/* Conditions */}
              {flow.conditions && Object.keys(flow.conditions).length > 0 && (
                <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-900 mb-1">
                    📋 Conditions:
                  </div>
                  <div className="text-xs text-yellow-800">
                    {JSON.stringify(flow.conditions, null, 2)}
                  </div>
                </div>
              )}

              {/* Actions */}
              {flow.actions && flow.actions.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-900 mb-2">
                    ⚡ Actions:
                  </div>
                  <div className="space-y-2">
                    {flow.actions.map((action: any, i: number) => (
                      <div
                        key={i}
                        className="text-xs text-green-800 bg-white p-2 rounded border"
                      >
                        <strong>{i + 1}.</strong> {action.type}
                        {action.message && (
                          <div className="mt-1 text-gray-600 truncate">
                            "{action.message.substring(0, 60)}..."
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <Card className="p-4 border bg-gray-50">
        <h3 className="font-semibold mb-2">💡 Hướng dẫn:</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>
            <strong>Visit-based:</strong> Tự động chạy sau khi khách làm dịch vụ
          </li>
          <li>
            <strong>Time-based:</strong> Chạy theo cron job (mỗi giờ/ngày) dựa trên thời gian
          </li>
          <li>
            <strong>Tag-based:</strong> Chạy khi khách có tag cụ thể
          </li>
          <li>
            <strong>AI-based:</strong> Chạy khi AI Insight có điều kiện cụ thể (ví dụ: HIGH churn risk)
          </li>
          <li>
            <strong>Event-based:</strong> Chạy khi có sự kiện (sinh nhật, etc.)
          </li>
          <li>
            <strong>Manual:</strong> Chạy tay từ UI hoặc API
          </li>
        </ul>
      </Card>
    </div>
  );
}

