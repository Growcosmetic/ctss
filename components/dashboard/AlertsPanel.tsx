"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, Info, X, CheckCircle, HelpCircle } from "lucide-react";
import { AlertType, AlertSeverity, AlertStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import AlertExplainModal from "@/components/alerts/AlertExplainModal";

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  createdAt: string;
}

interface AlertsPanelProps {
  limit?: number;
  showActions?: boolean;
}

export default function AlertsPanel({ limit = 5, showActions = true }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedAlertTitle, setSelectedAlertTitle] = useState<string>("");

  useEffect(() => {
    fetchAlerts();
    // Refresh every 60 seconds
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/alerts?unreadOnly=true&limit=${limit}`);
      const result = await res.json();
      if (result.success) {
        setAlerts(result.data.alerts || []);
      } else {
        setError(result.error || "Failed to load alerts");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (alertId: string, action: "acknowledge" | "resolve" | "dismiss") => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        // Remove from list
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch (error) {
      console.error(`Failed to ${action} alert:`, error);
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-50 border-red-200 text-red-800";
      case "HIGH":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "MEDIUM":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "LOW":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return <AlertTriangle className="w-5 h-5" />;
      case "MEDIUM":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
        <p className="text-gray-600 font-medium">Không có cảnh báo nào</p>
        <p className="text-sm text-gray-500 mt-1">Tất cả hệ thống đang hoạt động bình thường</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Cảnh báo hệ thống</h3>
        <span className="text-sm text-gray-500">{alerts.length} cảnh báo</span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm mb-1">{alert.title}</p>
                <p className="text-xs opacity-90 mb-2">{alert.message}</p>
                {showActions && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAlertId(alert.id);
                        setSelectedAlertTitle(alert.title);
                        setExplainModalOpen(true);
                      }}
                      className="text-xs h-7 flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      Vì sao?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(alert.id, "acknowledge")}
                      className="text-xs h-7"
                    >
                      Đã xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(alert.id, "resolve")}
                      className="text-xs h-7"
                    >
                      Đã xử lý
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {alerts.length >= limit && (
        <div className="mt-4 text-center">
          <a
            href="/dashboard/insights"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Xem tất cả cảnh báo →
          </a>
        </div>
      )}

      {/* Alert Explain Modal */}
      {selectedAlertId && (
        <AlertExplainModal
          alertId={selectedAlertId}
          alertTitle={selectedAlertTitle}
          isOpen={explainModalOpen}
          onClose={() => {
            setExplainModalOpen(false);
            setSelectedAlertId(null);
            setSelectedAlertTitle("");
          }}
        />
      )}
    </div>
  );
}

