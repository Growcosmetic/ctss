// ============================================
// Stylist Coach - Technical Recommendation Card
// ============================================

"use client";

import React from "react";
import {
  Target,
  AlertCircle,
  Clock,
  CheckCircle2,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface TechnicalRecommendationCardProps {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  estimatedTime: number;
  processSteps: string[];
  productSuggestions: string[];
  aiGeneratedProcess: string;
}

export function TechnicalRecommendationCard({
  riskLevel,
  estimatedTime,
  processSteps,
  productSuggestions,
  aiGeneratedProcess,
}: TechnicalRecommendationCardProps) {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case "HIGH":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: AlertCircle,
          iconColor: "text-red-600",
          label: "CAO",
          description: "Cần cẩn thận đặc biệt",
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: AlertCircle,
          iconColor: "text-amber-600",
          label: "TRUNG BÌNH",
          description: "Theo dõi sát trong quá trình",
        };
      default: // LOW
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: CheckCircle2,
          iconColor: "text-green-600",
          label: "THẤP",
          description: "An toàn để thực hiện",
        };
    }
  };

  const riskConfig = getRiskConfig();
  const RiskIcon = riskConfig.icon;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} giờ ${mins > 0 ? `${mins} phút` : ""}`;
    }
    return `${mins} phút`;
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 space-y-4 md:space-y-6 animate-slideUp">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Target className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Gợi ý kỹ thuật từ AI
        </h3>
        <Sparkles className="w-4 h-4 text-indigo-500" />
      </div>

      {/* Risk Level & Time */}
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm ${riskConfig.bg} ${riskConfig.border}`}
        >
          <RiskIcon className={`w-4 h-4 ${riskConfig.iconColor}`} />
          <div>
            <div className={`text-sm font-semibold ${riskConfig.text}`}>
              Mức rủi ro: {riskConfig.label}
            </div>
            <div className={`text-xs ${riskConfig.text} opacity-80`}>
              {riskConfig.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <Clock className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-xs text-blue-600">Thời gian dự kiến</div>
            <div className="text-sm font-semibold text-blue-700">
              {formatTime(estimatedTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      {processSteps && processSteps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-medium text-gray-800">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span>Quy trình đề xuất</span>
          </div>
          <div className="space-y-2 pl-6">
            {processSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="flex-1 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Suggestions */}
      {productSuggestions && productSuggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-medium text-gray-800">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Sản phẩm đề xuất</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {productSuggestions.map((product, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-200"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{product}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Generated Detailed Process */}
      {aiGeneratedProcess && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-gray-800 text-sm">
              Quy trình chi tiết từ AI
            </span>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 p-4 md:p-6 rounded-lg text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {aiGeneratedProcess}
          </div>
        </div>
      )}
    </div>
  );
}

