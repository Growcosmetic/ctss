"use client";

import { Bell, AlertTriangle, AlertCircle, Info, X, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { AlertType, AlertSeverity } from "@prisma/client";
import AlertExplainModal from "./AlertExplainModal";

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: string;
}

interface AlertBadgeProps {
  className?: string;
}

export default function AlertBadge({ className }: AlertBadgeProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedAlertTitle, setSelectedAlertTitle] = useState<string>("");

  useEffect(() => {
    fetchAlerts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts?unreadOnly=true&limit=10");
      const result = await res.json();
      if (result.success) {
        setAlerts(result.data.alerts || []);
        setCount(result.data.counts?.active || 0);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return <AlertTriangle className="w-4 h-4" />;
      case "MEDIUM":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <Bell className="w-5 h-5 text-gray-600" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className={`relative ${className}`}>
        <Bell className="w-5 h-5 text-gray-600" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={`${count} alerts`}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {count > 0 && (
          <span
            className={`absolute top-0 right-0 w-5 h-5 rounded-full ${getSeverityColor(
              alerts[0]?.severity || "MEDIUM"
            )} text-white text-xs flex items-center justify-center font-bold`}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Thông báo ({count})</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {alerts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Không có thông báo mới
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full ${getSeverityColor(
                          alert.severity
                        )} flex items-center justify-center text-white`}
                      >
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {alert.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {new Date(alert.createdAt).toLocaleString("vi-VN")}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlertId(alert.id);
                              setSelectedAlertTitle(alert.title);
                              setExplainModalOpen(true);
                              setShowDropdown(false);
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <HelpCircle className="w-3 h-3" />
                            Vì sao?
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {alerts.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <a
                  href="/dashboard/insights"
                  className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                  onClick={() => setShowDropdown(false)}
                >
                  Xem tất cả
                </a>
              </div>
            )}
          </div>
        </>
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

