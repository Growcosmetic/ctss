// ============================================
// Customer360 AI Risk Card
// ============================================

"use client";

import React from "react";
import { AlertTriangle, Shield, AlertCircle, CheckCircle } from "lucide-react";

interface InsightRiskCardProps {
  risk: "LOW" | "MEDIUM" | "HIGH";
  cluster?: string;
}

export function InsightRiskCard({ risk, cluster }: InsightRiskCardProps) {
  const getConfig = () => {
    switch (risk) {
      case "HIGH":
        return {
          bg: "bg-gradient-to-br from-red-50 to-red-100",
          border: "border-red-200",
          text: "text-red-700",
          titleText: "text-red-900",
          icon: AlertTriangle,
          iconColor: "text-red-600",
          iconBg: "bg-red-100",
          label: "Rủi ro rời bỏ: Cao",
          description: "Khách có dấu hiệu giảm tần suất ghé thăm hoặc không quay lại trong thời gian dài. Cần ưu tiên follow-up và tạo ưu đãi comeback.",
        };
      case "MEDIUM":
        return {
          bg: "bg-gradient-to-br from-amber-50 to-yellow-100",
          border: "border-amber-200",
          text: "text-amber-700",
          titleText: "text-amber-900",
          icon: AlertCircle,
          iconColor: "text-amber-600",
          iconBg: "bg-amber-100",
          label: "Rủi ro rời bỏ: Trung bình",
          description: "Khách có một số dấu hiệu giảm engagement. Nên duy trì liên lạc và chăm sóc định kỳ để giữ chân khách.",
        };
      default: // LOW
        return {
          bg: "bg-gradient-to-br from-green-50 to-emerald-100",
          border: "border-green-200",
          text: "text-green-700",
          titleText: "text-green-900",
          icon: CheckCircle,
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
          label: "Rủi ro rời bỏ: Thấp",
          description: "Khách có mức độ gắn bó tốt và thường xuyên quay lại. Tiếp tục duy trì chất lượng dịch vụ và tìm cơ hội upsell.",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  if (!risk) return null;

  return (
    <div
      className={`rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 ${config.bg} ${config.border}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-lg ${config.iconBg}`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-1 ${config.titleText}`}>
            Đánh giá rủi ro
          </h3>
          <div className={`text-xl font-bold ${config.text}`}>
            {config.label}
          </div>
        </div>
      </div>

      <div className={`text-sm mt-3 leading-relaxed ${config.text} opacity-90`}>
        {config.description}
      </div>

      {cluster && (
        <div className="mt-4 pt-4 border-t border-current opacity-20">
          <div className="flex items-center gap-2 text-xs">
            <span className={config.text}>
              Nhóm hành vi: <strong>{cluster}</strong>
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-current opacity-20">
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-3.5 h-3.5" />
          <span className={config.text}>
            Phân tích từ lịch sử đến – chi tiêu – thói quen của khách
          </span>
        </div>
      </div>
    </div>
  );
}

