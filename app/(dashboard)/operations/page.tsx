"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type TabType = "monitoring" | "kpi" | "alerts";

export default function OperationsDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("monitoring");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [compliance, setCompliance] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadDashboard();
  }, [selectedDate]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedRole) params.append("role", selectedRole);

      const res = await fetch(
        `/api/operations/dashboard?${params.toString()}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Load dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkCompliance = async (role: string) => {
    try {
      const res = await fetch("/api/operations/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, date: selectedDate }),
      });
      const json = await res.json();
      if (json.success) {
        setCompliance({ ...json.compliance, role });
      }
    } catch (err) {
      console.error("Check compliance error:", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📊 Operations Dashboard</h1>
        <div className="flex gap-4 items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              loadDashboard();
            }}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Tất cả bộ phận</option>
            <option value="receptionist">Lễ tân</option>
            <option value="stylist">Stylist</option>
            <option value="assistant">Pha chế</option>
            <option value="online">CSKH Online</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("monitoring")}
          className={`px-4 py-2 font-medium ${
            activeTab === "monitoring"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          ⚡ Real-time Monitoring
        </button>
        <button
          onClick={() => setActiveTab("kpi")}
          className={`px-4 py-2 font-medium ${
            activeTab === "kpi"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          📈 KPI Vận hành
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2 font-medium ${
            activeTab === "alerts"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          ⚠️ Alerts & Warnings
        </button>
      </div>

      {/* Tab Content: Monitoring */}
      {activeTab === "monitoring" && (
        <Card className="p-6 border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">⚡ Hoạt động gần nhất</h2>
            <div className="text-sm text-gray-600">
              Khách đang hoạt động: <strong>{data.activeCustomers}</strong>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có hoạt động nào trong ngày
              </div>
            ) : (
              data.logs.map((log: any) => {
                const roleColors: Record<string, string> = {
                  receptionist: "bg-blue-50 border-blue-200",
                  stylist: "bg-pink-50 border-pink-200",
                  assistant: "bg-green-50 border-green-200",
                  online: "bg-yellow-50 border-yellow-200",
                };

                return (
                  <div
                    key={log.id}
                    className={`text-sm p-3 rounded-lg border ${roleColors[log.role] || "bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-gray-900">
                          {log.role.toUpperCase()}
                        </strong>
                        {" — "}
                        <span className="text-gray-700">{log.action}</span>
                        {log.user && (
                          <span className="text-gray-500 ml-2">
                            • {log.user.name}
                          </span>
                        )}
                        {log.customer && (
                          <span className="text-gray-500 ml-2">
                            • Khách: {log.customer.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Bước {log.sopStep}/7 •{" "}
                        {new Date(log.timestamp).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* Tab Content: KPI */}
      {activeTab === "kpi" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 border bg-blue-50">
              <div className="text-sm text-gray-600 mb-1">Lễ tân</div>
              <div className="text-3xl font-bold text-blue-700">
                {data.kpi.receptionist}
              </div>
              <div className="text-xs text-gray-500 mt-1">hoạt động</div>
            </Card>
            <Card className="p-6 border bg-pink-50">
              <div className="text-sm text-gray-600 mb-1">Stylist</div>
              <div className="text-3xl font-bold text-pink-700">
                {data.kpi.stylist}
              </div>
              <div className="text-xs text-gray-500 mt-1">hoạt động</div>
            </Card>
            <Card className="p-6 border bg-green-50">
              <div className="text-sm text-gray-600 mb-1">Pha chế</div>
              <div className="text-3xl font-bold text-green-700">
                {data.kpi.assistant}
              </div>
              <div className="text-xs text-gray-500 mt-1">hoạt động</div>
            </Card>
            <Card className="p-6 border bg-yellow-50">
              <div className="text-sm text-gray-600 mb-1">CSKH Online</div>
              <div className="text-3xl font-bold text-yellow-700">
                {data.kpi.online}
              </div>
              <div className="text-xs text-gray-500 mt-1">hoạt động</div>
            </Card>
          </div>

          {/* SOP Step Breakdown */}
          <Card className="p-6 border">
            <h3 className="font-semibold text-lg mb-4">
              Phân bố theo bước SOP
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                <div key={step} className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-gray-900">
                    {data.kpi.stepCounts[step] || 0}
                  </div>
                  <div className="text-xs text-gray-600">Bước {step}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Compliance Checker */}
          <Card className="p-6 border">
            <h3 className="font-semibold text-lg mb-4">
              🔍 AI Kiểm tra Tuân thủ SOP
            </h3>
            <div className="flex gap-2 mb-4">
              {["receptionist", "stylist", "assistant", "online"].map(
                (role) => (
                  <Button
                    key={role}
                    onClick={() => checkCompliance(role)}
                    className="text-sm"
                  >
                    Kiểm tra {role}
                  </Button>
                )
              )}
            </div>

            {compliance && (
              <div
                className={`p-4 rounded-lg border ${
                  compliance.passed
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">
                    Bộ phận: {compliance.role.toUpperCase()}
                  </div>
                  <div className="text-sm">
                    Tỷ lệ tuân thủ:{" "}
                    <strong>{compliance.complianceRate || 0}%</strong>
                  </div>
                </div>

                {compliance.summary && (
                  <div className="text-sm mb-3">{compliance.summary}</div>
                )}

                {compliance.issues && compliance.issues.length > 0 && (
                  <div className="mb-3">
                    <div className="font-semibold text-red-700 mb-1">
                      ⚠️ Vấn đề:
                    </div>
                    <ul className="list-disc ml-6 text-sm space-y-1">
                      {compliance.issues.map((issue: any, i: number) => (
                        <li key={i}>
                          <strong>Bước {issue.step}:</strong> {issue.description}
                          <br />
                          <span className="text-gray-600">
                            → {issue.recommendation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {compliance.warnings && compliance.warnings.length > 0 && (
                  <div className="mb-3">
                    <div className="font-semibold text-yellow-700 mb-1">
                      ⚠️ Cảnh báo:
                    </div>
                    <ul className="list-disc ml-6 text-sm space-y-1">
                      {compliance.warnings.map((w: any, i: number) => (
                        <li key={i}>
                          <strong>Bước {w.step}:</strong> {w.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {compliance.suggestions && compliance.suggestions.length > 0 && (
                  <div>
                    <div className="font-semibold text-blue-700 mb-1">
                      💡 Gợi ý:
                    </div>
                    <ul className="list-disc ml-6 text-sm space-y-1">
                      {compliance.suggestions.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab Content: Alerts */}
      {activeTab === "alerts" && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">⚠️ Alerts & Warnings</h2>
          <div className="space-y-4">
            {/* TODO: Implement alerts logic */}
            <div className="text-center py-8 text-gray-500">
              Tính năng đang phát triển...
              <br />
              <small>
                Alerts sẽ tự động cảnh báo khi: Lễ tân quên cập nhật, Stylist
                đi sai SOP, Pha chế nhập sai, CSKH quá 3 phút chưa trả lời...
              </small>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

