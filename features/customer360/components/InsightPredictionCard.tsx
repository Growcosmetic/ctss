// ============================================
// Customer360 AI Prediction Card
// ============================================

"use client";

import React from "react";
import {
  TrendingUp,
  Calendar,
  Scissors,
  Package,
  Target,
  BarChart3,
} from "lucide-react";
import type { CustomerAIInsights } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface InsightPredictionCardProps {
  insights: CustomerAIInsights;
}

export function InsightPredictionCard({
  insights,
}: InsightPredictionCardProps) {
  if (!insights) return null;

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Chưa xác định";
    try {
      return format(new Date(dateString), "EEEE, dd MMMM yyyy", { locale: vi });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  const getLikelihoodColor = (likelihood: number) => {
    if (likelihood >= 70) return "text-green-600";
    if (likelihood >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getLikelihoodBg = (likelihood: number) => {
    if (likelihood >= 70) return "bg-green-50 border-green-200";
    if (likelihood >= 40) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  if (!insights) return null;

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <BarChart3 className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Dự đoán hành vi
        </h3>
        <Target className="w-4 h-4 text-green-500" />
      </div>

      <div className="space-y-5">
        {/* RETURN LIKELIHOOD */}
        <div className="p-4 rounded-lg border bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <div className="text-sm font-medium text-gray-600">
              Khả năng quay lại
            </div>
          </div>
          <div
            className={`text-3xl font-bold ${getLikelihoodColor(
              insights.returnLikelihood
            )}`}
          >
            {insights.returnLikelihood}%
          </div>
          <div
            className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getLikelihoodBg(
              insights.returnLikelihood
            )} ${getLikelihoodColor(insights.returnLikelihood)}`}
          >
            {insights.returnLikelihood >= 70
              ? "Rất cao"
              : insights.returnLikelihood >= 40
              ? "Trung bình"
              : "Thấp"}
          </div>
        </div>

        {/* PREDICTED NEXT VISIT */}
        <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div className="text-sm font-medium text-gray-700">
              Ngày dự đoán quay lại
            </div>
          </div>
          <div className="font-semibold text-gray-900 text-base">
            {formatDate(insights?.predictedNextVisit)}
          </div>
          {insights?.predictedNextVisit && (
            <div className="text-xs text-gray-500 mt-1">
              {format(new Date(insights.predictedNextVisit), "dd/MM/yyyy", {
                locale: vi,
              })}
            </div>
          )}
        </div>

        {/* NEXT SERVICE */}
        <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="w-4 h-4 text-purple-600" />
            <div className="text-sm font-medium text-gray-700">
              Dịch vụ tiếp theo
            </div>
          </div>
          {insights?.nextService ? (
            <div className="font-semibold text-gray-900 text-base">
              {insights.nextService}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Chưa có gợi ý
            </div>
          )}
        </div>

        {/* NEXT PRODUCT */}
        <div className="p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-amber-600" />
            <div className="text-sm font-medium text-gray-700">
              Sản phẩm phù hợp
            </div>
          </div>
          {insights?.nextProduct ? (
            <div className="font-semibold text-gray-900 text-base">
              {insights.nextProduct}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Chưa có đề xuất
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

