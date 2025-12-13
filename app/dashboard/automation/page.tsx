"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Settings, Play, Pause, Trash2, History, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { AutomationTrigger, AutomationAction } from "@prisma/client";
import Modal from "@/components/ui/Modal";

interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  trigger: AutomationTrigger;
  action: AutomationAction;
  enabled: boolean;
  conditions: Record<string, any> | null;
  config: Record<string, any> | null;
  schedule: string | null;
  enabledAt: string | null;
  createdAt: string;
  logCount: number;
}

interface AutomationLog {
  id: string;
  triggerId: string | null;
  triggerType: string;
  status: string;
  action: AutomationAction;
  result: Record<string, any> | null;
  error: string | null;
  rolledBack: boolean;
  executedAt: string;
  rule: {
    id: string;
    name: string;
    action: AutomationAction;
  };
}

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/automation/rules");
      const result = await res.json();

      if (result.success) {
        setRules(result.data.rules);
      } else {
        setError(result.error || "Failed to load rules");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/automation/logs?ruleId=${ruleId}&limit=20`);
      const result = await res.json();

      if (result.success) {
        setLogs(result.data.logs);
        setShowLogsModal(true);
      }
    } catch (err: any) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const handleToggle = async (ruleId: string, currentEnabled: boolean) => {
    setToggling(ruleId);

    try {
      const res = await fetch(`/api/automation/rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      if (res.ok) {
        fetchRules(); // Refresh
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa rule này?")) {
      return;
    }

    try {
      const res = await fetch(`/api/automation/rules/${ruleId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchRules(); // Refresh
      }
    } catch (error) {
      console.error("Failed to delete rule:", error);
    }
  };

  const getTriggerLabel = (trigger: AutomationTrigger) => {
    switch (trigger) {
      case "ACTION_HIGH_PRIORITY":
        return "Khi có Action mức độ CAO";
      case "ACTION_CRITICAL_PRIORITY":
        return "Khi có Action mức độ NGHIÊM TRỌNG";
      case "ALERT_CRITICAL":
        return "Khi có Alert mức độ NGHIÊM TRỌNG";
      case "ALERT_HIGH":
        return "Khi có Alert mức độ CAO";
      case "SCHEDULED":
        return "Theo lịch (Cron)";
      case "MANUAL":
        return "Thủ công";
      default:
        return trigger;
    }
  };

  const getActionLabel = (action: AutomationAction) => {
    switch (action) {
      case "SEND_NOTIFICATION":
        return "Gửi thông báo";
      case "CREATE_TASK":
        return "Tạo task";
      case "UPDATE_STATUS":
        return "Cập nhật trạng thái";
      case "SEND_EMAIL":
        return "Gửi email";
      case "LOG_EVENT":
        return "Ghi log";
      default:
        return action;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      case "PARTIAL":
        return "text-yellow-600";
      case "ROLLED_BACK":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4" />;
      case "FAILED":
        return <XCircle className="w-4 h-4" />;
      case "PARTIAL":
        return <AlertCircle className="w-4 h-4" />;
      case "ROLLED_BACK":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading && rules.length === 0) {
    return (
      <RoleGuard roles={[CTSSRole.OWNER]}>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-3 text-gray-600">Đang tải automation rules...</span>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard roles={[CTSSRole.OWNER]}>
        <MainLayout>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu</p>
            <p className="text-red-600 mt-2">{error}</p>
            <Button variant="primary" onClick={fetchRules} className="mt-4">
              Thử lại
            </Button>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard roles={[CTSSRole.OWNER]}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-8 h-8 text-primary-600" />
                Automation Engine
              </h1>
              <p className="text-gray-600 mt-1">Quản lý các quy tắc tự động hóa an toàn</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Tạo Rule mới
            </Button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Lưu ý về Automation</p>
                <p className="text-sm text-blue-700 mt-1">
                  Tất cả automation rules mặc định TẮT. Chỉ OWNER có thể bật/tắt từng rule.
                  Mọi thao tác tự động đều được ghi log và có thể rollback.
                </p>
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Chưa có automation rule nào</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tạo rule mới để tự động hóa các hành động
                </p>
                <Button variant="primary" onClick={() => setShowCreateModal(true)} className="mt-4">
                  Tạo Rule đầu tiên
                </Button>
              </div>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            rule.enabled
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {rule.enabled ? "ĐANG BẬT" : "ĐANG TẮT"}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          <strong>Trigger:</strong> {getTriggerLabel(rule.trigger)}
                        </span>
                        <span>
                          <strong>Action:</strong> {getActionLabel(rule.action)}
                        </span>
                        <span>
                          <strong>Logs:</strong> {rule.logCount}
                        </span>
                        {rule.enabledAt && (
                          <span>
                            Bật lúc: {new Date(rule.enabledAt).toLocaleString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {/* Toggle Switch */}
                      <div className="flex items-center gap-2">
                        {toggling === rule.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        ) : (
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggle(rule.id, rule.enabled)}
                            disabled={toggling !== null}
                          />
                        )}
                        <span className="text-sm text-gray-600">
                          {rule.enabled ? "Bật" : "Tắt"}
                        </span>
                      </div>

                      {/* View Logs */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRuleId(rule.id);
                          fetchLogs(rule.id);
                        }}
                        className="flex items-center gap-1"
                      >
                        <History className="w-4 h-4" />
                        Logs
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Rule Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Tạo Automation Rule mới"
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={() => {
                // TODO: Implement create form
                alert("Form tạo rule sẽ được implement sau");
                setShowCreateModal(false);
              }}>
                Tạo
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Form tạo automation rule sẽ được implement trong phase tiếp theo.
              Hiện tại có thể tạo rule qua API hoặc database trực tiếp.
            </p>
          </div>
        </Modal>

        {/* Logs Modal */}
        <Modal
          isOpen={showLogsModal}
          onClose={() => {
            setShowLogsModal(false);
            setSelectedRuleId(null);
            setLogs([]);
          }}
          title="Automation Logs"
          footer={
            <Button variant="outline" onClick={() => {
              setShowLogsModal(false);
              setSelectedRuleId(null);
              setLogs([]);
            }}>
              Đóng
            </Button>
          }
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có log nào
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                        </span>
                        <span className={`text-sm ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                        {log.rolledBack && (
                          <span className="text-xs text-gray-500">(Đã rollback)</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        Rule: {log.rule.name} • Action: {getActionLabel(log.action)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.executedAt).toLocaleString("vi-VN")}
                      </p>
                      {log.error && (
                        <p className="text-xs text-red-600 mt-1">{log.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      </MainLayout>
    </RoleGuard>
  );
}

