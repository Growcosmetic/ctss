"use client";

import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { LowStockAlert } from "../types";
import { cn } from "@/lib/utils";

interface LowStockAlertCardProps {
  alert: LowStockAlert;
}

export default function LowStockAlertCard({ alert }: LowStockAlertCardProps) {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case "CRITICAL":
        return "border-red-500 bg-red-50";
      case "WARNING":
        return "border-yellow-500 bg-yellow-50";
      case "LOW":
        return "border-orange-500 bg-orange-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const getSeverityText = () => {
    switch (alert.severity) {
      case "CRITICAL":
        return "Nghiêm trọng";
      case "WARNING":
        return "Cảnh báo";
      case "LOW":
        return "Thấp";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl p-4 border-2",
        getSeverityColor()
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {alert.productName}
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tồn kho hiện tại:</span>
              <span className="font-medium text-gray-900">
                {alert.currentStock.toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mức tối thiểu:</span>
              <span className="font-medium text-gray-900">
                {alert.minLevel.toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>
                Dự kiến hết trong {alert.daysUntilOut} ngày
              </span>
            </div>
          </div>
          <div className="mt-3">
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded",
                alert.severity === "CRITICAL"
                  ? "bg-red-100 text-red-700"
                  : alert.severity === "WARNING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-orange-100 text-orange-700"
              )}
            >
              {getSeverityText()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

