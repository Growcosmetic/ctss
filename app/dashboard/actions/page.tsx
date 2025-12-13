"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Clock, Filter, Loader2, ExternalLink, Sparkles } from "lucide-react";
import { ActionStatus, ActionPriority, ActionSource } from "@prisma/client";
import Link from "next/link";

interface AIAction {
  id: string;
  source: ActionSource;
  sourceId: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  title: string;
  description: string;
  contextLink: string | null;
  metadata: Record<string, any> | null;
  completedAt: string | null;
  completedBy: string | null;
  ignoredAt: string | null;
  ignoredBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ActionsData {
  actions: AIAction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  counts: {
    pending: number;
    done: number;
    ignored: number;
    criticalPending: number;
  };
}

export default function ActionsPage() {
  const [data, setData] = useState<ActionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status: ActionStatus | null;
    priority: ActionPriority | null;
    source: ActionSource | null;
  }>({
    status: null,
    priority: null,
    source: null,
  });

  useEffect(() => {
    fetchActions();
  }, [filters]);

  const fetchActions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.source) params.append("source", filters.source);

      const res = await fetch(`/api/ai/actions?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to load actions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load actions");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (actionId: string, newStatus: ActionStatus) => {
    try {
      const res = await fetch(`/api/ai/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchActions(); // Refresh
      }
    } catch (error) {
      console.error("Failed to update action:", error);
    }
  };

  const getPriorityColor = (priority: ActionPriority) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300 text-red-800";
      case "HIGH":
        return "bg-orange-100 border border-orange-300 text-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 border border-yellow-300 text-yellow-800";
      case "LOW":
        return "bg-blue-100 border border-blue-300 text-blue-800";
      default:
        return "bg-gray-100 border border-gray-300 text-gray-800";
    }
  };

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case "DONE":
        return "text-green-600";
      case "IGNORED":
        return "text-gray-600";
      case "PENDING":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="w-4 h-4" />;
      case "IGNORED":
        return <XCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSourceLabel = (source: ActionSource) => {
    switch (source) {
      case "AI_SUMMARY":
        return "AI Summary";
      case "ALERT_EXPLANATION":
        return "Alert";
      case "MANUAL":
        return "Thủ công";
      default:
        return source;
    }
  };

  if (loading && !data) {
    return (
      <RoleGuard roles={[CTSSRole.OWNER, CTSSRole.ADMIN]}>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-3 text-gray-600">Đang tải hành động...</span>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard roles={[CTSSRole.OWNER, CTSSRole.ADMIN]}>
        <MainLayout>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Lỗi khi tải dữ liệu</p>
            <p className="text-red-600 mt-2">{error}</p>
            <Button variant="primary" onClick={fetchActions} className="mt-4">
              Thử lại
            </Button>
          </div>
        </MainLayout>
      </RoleGuard>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <RoleGuard roles={[CTSSRole.OWNER, CTSSRole.ADMIN]}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary-600" />
                AI Action Engine
              </h1>
              <p className="text-gray-600 mt-1">Quản lý các hành động được đề xuất từ AI</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">Đang chờ</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.counts.pending}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Hoàn thành</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.counts.done}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Đã bỏ qua</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.counts.ignored}</p>
            </div>
            <div className="bg-white rounded-lg border border-red-200 p-4 bg-red-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-800 font-medium">Nghiêm trọng</span>
              </div>
              <p className="text-2xl font-bold text-red-900 mt-1">{data.counts.criticalPending}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Lọc:</span>

              {/* Status Filter */}
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters({ ...filters, status: (e.target.value || null) as ActionStatus | null })
                }
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ</option>
                <option value="DONE">Hoàn thành</option>
                <option value="IGNORED">Đã bỏ qua</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filters.priority || ""}
                onChange={(e) =>
                  setFilters({ ...filters, priority: (e.target.value || null) as ActionPriority | null })
                }
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">Tất cả mức độ</option>
                <option value="CRITICAL">Nghiêm trọng</option>
                <option value="HIGH">Cao</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>

              {/* Source Filter */}
              <select
                value={filters.source || ""}
                onChange={(e) =>
                  setFilters({ ...filters, source: (e.target.value || null) as ActionSource | null })
                }
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">Tất cả nguồn</option>
                <option value="AI_SUMMARY">AI Summary</option>
                <option value="ALERT_EXPLANATION">Alert</option>
                <option value="MANUAL">Thủ công</option>
              </select>

              {/* Clear Filters */}
              {(filters.status || filters.priority || filters.source) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ status: null, priority: null, source: null })}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Actions List */}
          <div className="space-y-3">
            {data.actions.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Không có hành động nào</p>
                <p className="text-sm text-gray-500 mt-1">
                  {filters.status || filters.priority || filters.source
                    ? "Thử thay đổi bộ lọc"
                    : "Các hành động từ AI Summary và Alerts sẽ xuất hiện ở đây"}
                </p>
              </div>
            ) : (
              data.actions.map((action) => (
                <div
                  key={action.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Priority Badge */}
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${getPriorityColor(
                        action.priority
                      )}`}
                    >
                      {action.priority}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Nguồn: {getSourceLabel(action.source)}</span>
                            <span>
                              Tạo: {new Date(action.createdAt).toLocaleString("vi-VN")}
                            </span>
                            {action.completedAt && (
                              <span>
                                Hoàn thành: {new Date(action.completedAt).toLocaleString("vi-VN")}
                              </span>
                            )}
                            {action.ignoredAt && (
                              <span>
                                Bỏ qua: {new Date(action.ignoredAt).toLocaleString("vi-VN")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-3">
                          {/* Status */}
                          <div
                            className={`flex items-center gap-1 ${getStatusColor(action.status)}`}
                          >
                            {getStatusIcon(action.status)}
                            <span className="text-sm font-medium">{action.status}</span>
                          </div>

                          {/* Context Link */}
                          {action.contextLink && (
                            <Link href={action.contextLink} target="_blank">
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                Xem
                              </Button>
                            </Link>
                          )}

                          {/* Action Buttons */}
                          {action.status === ActionStatus.PENDING && (
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleStatusChange(action.id, ActionStatus.DONE)}
                              >
                                Hoàn thành
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(action.id, ActionStatus.IGNORED)}
                              >
                                Bỏ qua
                              </Button>
                            </div>
                          )}

                          {action.status === ActionStatus.DONE && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(action.id, ActionStatus.PENDING)}
                            >
                              Đánh dấu chưa xong
                            </Button>
                          )}

                          {action.status === ActionStatus.IGNORED && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(action.id, ActionStatus.PENDING)}
                            >
                              Khôi phục
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {data.pagination.hasMore && (
            <div className="text-center">
              <Button variant="outline" onClick={() => fetchActions()}>
                Tải thêm
              </Button>
            </div>
          )}
        </div>
      </MainLayout>
    </RoleGuard>
  );
}

