"use client";

import React, { useEffect } from "react";
import { CustomerQuickInfo } from "../types";
import { User, Phone, Clock, AlertTriangle, FileText } from "lucide-react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface CustomerQuickPanelProps {
  customerInfo: CustomerQuickInfo | null;
  loading?: boolean;
  onClose?: () => void;
}

export default function CustomerQuickPanel({
  customerInfo,
  loading,
  onClose,
}: CustomerQuickPanelProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!customerInfo) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-center text-gray-500">Chọn lịch hẹn để xem thông tin khách hàng</p>
      </div>
    );
  }

  const churnRiskLevel = customerInfo.churnRisk?.level || "LOW";
  const riskColor =
    churnRiskLevel === "HIGH"
      ? "text-red-600 bg-red-50"
      : churnRiskLevel === "MEDIUM"
      ? "text-yellow-600 bg-yellow-50"
      : "text-green-600 bg-green-50";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{customerInfo.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{customerInfo.phone}</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Churn Risk Indicator */}
        {customerInfo.churnRisk && (
          <div className={`p-3 rounded-lg border ${riskColor}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <div className="font-semibold text-sm">
                  Rủi ro: {churnRiskLevel}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {customerInfo.churnRisk.reason}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Services */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Dịch vụ gần đây
          </h4>
          {customerInfo.lastServices.length > 0 ? (
            <div className="space-y-2">
              {customerInfo.lastServices.map((service, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {service.serviceName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(service.date), "dd/MM/yyyy")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có dịch vụ nào</p>
          )}
        </div>

        {/* Mina Summary */}
        {customerInfo.minaSummary && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Tóm tắt từ Mina</h4>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <span className="font-medium">Lần đến:</span>{" "}
                  {customerInfo.minaSummary.totalVisits}
                </div>
                <div>
                  <span className="font-medium">Tổng chi tiêu:</span>{" "}
                  {customerInfo.minaSummary.totalSpent?.toLocaleString("vi-VN")} đ
                </div>
                {customerInfo.minaSummary.stylistPreference && (
                  <div>
                    <span className="font-medium">Stylist ưa thích:</span>{" "}
                    {customerInfo.minaSummary.stylistPreference}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {customerInfo.notes && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Ghi chú
            </h4>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700">{customerInfo.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

