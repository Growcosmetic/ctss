"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DashboardData {
  topLossProducts: Array<{
    product: {
      id: string;
      name: string;
      unit: string;
      category: string;
    };
    averageLossRate: number;
    alertCount: number;
  }>;
  topUsageStaff: Array<{
    staff: {
      id: string;
      name: string;
    };
    averageQty: number;
    serviceCount: number;
    mostUsedProduct: {
      name: string;
      unit: string;
    } | null;
    mostUsedQty: number;
  }>;
  inventoryMismatch: {
    stockOut: number;
    mixUsage: number;
    difference: number;
    mismatchPercent: number;
  };
  recentAlerts: Array<{
    id: string;
    type: string;
    severity: string;
    product: {
      id: string;
      name: string;
      unit: string;
    } | null;
    staff: {
      id: string;
      name: string;
    } | null;
    lossRate: number | null;
    fraudScore: number | null;
    description: string | null;
    detectedAt: string;
    status: string;
  }>;
  alertStats: {
    total: number;
    bySeverity: {
      CRITICAL: number;
      ALERT: number;
      WARNING: number;
    };
    byType: {
      LOSS: number;
      FRAUD: number;
      WASTAGE: number;
      INVENTORY_MISMATCH: number;
    };
    open: number;
  };
}

export default function LossControlPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadDashboard();
  }, [days]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/loss/dashboard?days=${days}`);
      const data = await res.json();
      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (err) {
      console.error("Load dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "ALERT":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LOSS: "Hao hụt",
      FRAUD: "Gian lận",
      WASTAGE: "Lãng phí",
      INVENTORY_MISMATCH: "Lệch tồn kho",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-red-600">
          Không thể tải dữ liệu
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            🛡️ Loss Control & Fraud Detection
          </h1>
          <p className="text-gray-600">
            Hệ thống kiểm soát thất thoát và phát hiện gian lận
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={60}>60 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
          <Button onClick={loadDashboard} variant="outline" size="sm">
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-red-300 bg-red-50">
          <div className="text-sm text-red-700 mb-1">Critical Alerts</div>
          <div className="text-3xl font-bold text-red-800">
            {dashboard.alertStats.bySeverity.CRITICAL}
          </div>
        </Card>
        <Card className="p-4 border border-orange-300 bg-orange-50">
          <div className="text-sm text-orange-700 mb-1">Alerts</div>
          <div className="text-3xl font-bold text-orange-800">
            {dashboard.alertStats.bySeverity.ALERT}
          </div>
        </Card>
        <Card className="p-4 border border-yellow-300 bg-yellow-50">
          <div className="text-sm text-yellow-700 mb-1">Warnings</div>
          <div className="text-3xl font-bold text-yellow-800">
            {dashboard.alertStats.bySeverity.WARNING}
          </div>
        </Card>
        <Card className="p-4 border bg-gray-50">
          <div className="text-sm text-gray-700 mb-1">Tổng cảnh báo</div>
          <div className="text-3xl font-bold text-gray-800">
            {dashboard.alertStats.total}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products với hao hụt cao nhất */}
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">
            🔥 Top 5 sản phẩm hao hụt cao nhất
          </h2>
          {dashboard.topLossProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu hao hụt
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.topLossProducts.map((item, idx) => (
                <div
                  key={item.product.id}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-red-600">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold">{item.product.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.alertCount} cảnh báo
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {item.averageLossRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Hao hụt TB</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top 5 Staff dùng nhiều thuốc nhất */}
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">
            👥 Top 5 nhân viên dùng nhiều thuốc nhất
          </h2>
          {dashboard.topUsageStaff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.topUsageStaff.map((item, idx) => (
                <div
                  key={item.staff.id}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold">{item.staff.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.serviceCount} dịch vụ
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {item.averageQty.toFixed(1)}
                        {item.mostUsedProduct?.unit || ""}/dịch vụ
                      </div>
                      {item.mostUsedProduct && (
                        <div className="text-xs text-gray-500">
                          {item.mostUsedProduct.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Inventory Mismatch */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">
          📦 Tồn kho vs Log pha chế
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700 mb-1">Kho xuất (OUT)</div>
            <div className="text-2xl font-bold text-blue-800">
              {dashboard.inventoryMismatch.stockOut.toFixed(1)}
            </div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Log pha chế</div>
            <div className="text-2xl font-bold text-green-800">
              {dashboard.inventoryMismatch.mixUsage.toFixed(1)}
            </div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-700 mb-1">Chênh lệch</div>
            <div className="text-2xl font-bold text-gray-800">
              {dashboard.inventoryMismatch.difference.toFixed(1)}
            </div>
          </div>
          <div
            className={`p-4 border rounded-lg ${
              Math.abs(dashboard.inventoryMismatch.mismatchPercent) > 10
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="text-sm mb-1">% Lệch</div>
            <div
              className={`text-2xl font-bold ${
                Math.abs(dashboard.inventoryMismatch.mismatchPercent) > 10
                  ? "text-red-800"
                  : "text-yellow-800"
              }`}
            >
              {dashboard.inventoryMismatch.mismatchPercent.toFixed(1)}%
            </div>
          </div>
        </div>
        {Math.abs(dashboard.inventoryMismatch.mismatchPercent) > 10 && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800">
            ⚠️ Cảnh báo: Chênh lệch tồn kho vượt mức cho phép! Cần kiểm tra
            ngay.
          </div>
        )}
      </Card>

      {/* Recent Alerts */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">📋 Lịch sử cảnh báo</h2>
        {dashboard.recentAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có cảnh báo nào
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard.recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${getSeverityColor(
                  alert.severity
                )}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="px-2 py-1 bg-white rounded text-xs">
                      {getTypeLabel(alert.type)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(alert.detectedAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div className="mb-2">
                  {alert.product && (
                    <span className="font-semibold">
                      {alert.product.name}
                    </span>
                  )}
                  {alert.staff && (
                    <span className="text-gray-600">
                      {" "}
                      - {alert.staff.name}
                    </span>
                  )}
                </div>
                {alert.description && (
                  <div className="text-sm mb-2">{alert.description}</div>
                )}
                <div className="flex items-center gap-4 text-sm">
                  {alert.lossRate !== null && (
                    <span>
                      Hao hụt: <strong>{alert.lossRate.toFixed(1)}%</strong>
                    </span>
                  )}
                  {alert.fraudScore !== null && (
                    <span>
                      Fraud Score:{" "}
                      <strong>{alert.fraudScore.toFixed(0)}/100</strong>
                    </span>
                  )}
                  <span
                    className={`ml-auto px-2 py-1 rounded ${
                      alert.status === "OPEN"
                        ? "bg-yellow-200 text-yellow-800"
                        : alert.status === "RESOLVED"
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

