// ============================================
// Customer360 AI Persona Card
// ============================================

"use client";

import React from "react";
import { Brain, Sparkles, User } from "lucide-react";

interface InsightPersonaCardProps {
  persona: string;
}

export function InsightPersonaCard({ persona }: InsightPersonaCardProps) {
  return (
    <div className="rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Brain className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Persona (AI)
        </h3>
        <Sparkles className="w-4 h-4 text-purple-500" />
      </div>

      {persona ? (
        <div className="relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
          <p className="text-gray-700 leading-relaxed text-sm pl-4 whitespace-pre-line">
            {persona || "Không có dữ liệu persona"}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
          <User className="w-4 h-4" />
          <span>Không có dữ liệu persona</span>
        </div>
      )}
    </div>
  );
}

