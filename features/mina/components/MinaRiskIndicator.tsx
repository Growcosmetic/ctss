"use client";

import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { ChurnRisk } from "../types";

interface MinaRiskIndicatorProps {
  risk: ChurnRisk | null;
  loading?: boolean;
}

export default function MinaRiskIndicator({ risk, loading }: MinaRiskIndicatorProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500">Chưa có dữ liệu</p>
      </div>
    );
  }

  const getRiskConfig = () => {
    switch (risk.riskLevel) {
      case "HIGH":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: "Rủi ro cao",
        };
      case "MEDIUM":
        return {
          icon: AlertTriangle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          label: "Rủi ro trung bình",
        };
      default:
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          label: "Rủi ro thấp",
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${config.borderColor} border-2`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${config.color}`} />
        <h3 className="text-lg font-semibold text-gray-900">Đánh giá rủi ro (AI Mina)</h3>
      </div>

      <div className={`p-4 rounded-lg mb-4 ${config.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">{config.label}</span>
          <span className={`text-sm font-bold ${config.color}`}>
            {Math.round(risk.score * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              risk.riskLevel === "HIGH"
                ? "bg-red-600"
                : risk.riskLevel === "MEDIUM"
                ? "bg-yellow-600"
                : "bg-green-600"
            }`}
            style={{ width: `${risk.score * 100}%` }}
          ></div>
        </div>
      </div>

      {risk.reasons.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Lý do:</h4>
          <ul className="space-y-1">
            {risk.reasons.map((reason, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

