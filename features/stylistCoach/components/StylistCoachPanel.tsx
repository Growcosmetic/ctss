// ============================================
// Stylist Coach - Main Panel Component
// ============================================

"use client";

import React from "react";
import { TechnicalAnalysisCard } from "./TechnicalAnalysisCard";
import { TechnicalRecommendationCard } from "./TechnicalRecommendationCard";
import { TechnicalNotesHistory } from "./TechnicalNotesHistory";
import type { TechnicalNote } from "../types/technicalNotes";

interface TechnicalAnalysis {
  lastProcessSummary: string | null;
  warnings: string[];
  strengths: string[];
  suggestions: string[];
  aiSummary: string;
}

interface StylistCoachData {
  analysis: TechnicalAnalysis;
  processSteps: string[];
  productSuggestions: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  estimatedTime: number;
  aiGeneratedProcess: string;
  technicalNotes?: TechnicalNote[];
}

interface StylistCoachPanelProps {
  data: StylistCoachData | null;
  loading?: boolean;
  error?: string | null;
}

export function StylistCoachPanel({
  data,
  loading,
  error,
}: StylistCoachPanelProps) {
  if (loading) {
    return (
      <div className="w-full p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang phân tích kỹ thuật...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">Lỗi khi phân tích</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <p className="text-gray-500">Chưa có dữ liệu phân tích.</p>
        </div>
      </div>
    );
  }

  const {
    analysis,
    processSteps,
    productSuggestions,
    riskLevel,
    estimatedTime,
    aiGeneratedProcess,
    technicalNotes,
  } = data;

  return (
    <div className="w-full p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen animate-fadeIn">
      <TechnicalAnalysisCard analysis={analysis} />

      <TechnicalRecommendationCard
        riskLevel={riskLevel}
        estimatedTime={estimatedTime}
        processSteps={processSteps}
        productSuggestions={productSuggestions}
        aiGeneratedProcess={aiGeneratedProcess}
      />

      {analysis?.lastProcessSummary && (
        <TechnicalNotesHistory
          summary={analysis.lastProcessSummary}
          notes={technicalNotes || []}
        />
      )}
    </div>
  );
}

