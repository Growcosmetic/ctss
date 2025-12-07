// ============================================
// Stylist Coach - Technical Analysis Card
// ============================================

"use client";

import React from "react";
import {
  FlaskConical,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  FileText,
  Clock,
} from "lucide-react";

interface TechnicalAnalysis {
  lastProcessSummary: string | null;
  warnings: string[];
  strengths: string[];
  suggestions: string[];
  aiSummary: string;
}

interface TechnicalAnalysisCardProps {
  analysis: TechnicalAnalysis | null;
}

export function TechnicalAnalysisCard({
  analysis,
}: TechnicalAnalysisCardProps) {
  if (!analysis) return null;

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 space-y-4 md:space-y-6 animate-slideUp">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FlaskConical className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Phân tích tình trạng tóc
        </h3>
      </div>

      {/* Last Process Summary */}
      {analysis.lastProcessSummary && (
        <div className="text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-900 mb-1">
                Dịch vụ gần nhất
              </div>
              <p className="text-gray-700">{analysis.lastProcessSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Cảnh báo ({analysis.warnings.length})</span>
          </div>
          <div className="space-y-2 pl-6">
            {analysis.warnings.map((warning, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200"
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Điểm mạnh ({analysis.strengths.length})</span>
          </div>
          <div className="space-y-2 pl-6">
            {analysis.strengths.map((strength, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200"
              >
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{strength}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>Gợi ý ({analysis.suggestions.length})</span>
          </div>
          <div className="space-y-2 pl-6">
            {analysis.suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200"
              >
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {analysis.aiSummary && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-800 text-sm">
              Tóm tắt từ AI
            </span>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-line bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 p-4 rounded-lg leading-relaxed">
            {analysis.aiSummary}
          </div>
        </div>
      )}
    </div>
  );
}

