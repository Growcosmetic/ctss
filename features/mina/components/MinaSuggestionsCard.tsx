"use client";

import React from "react";
import { Lightbulb, Plus } from "lucide-react";
import { ServiceSuggestion } from "../types";

interface MinaSuggestionsCardProps {
  suggestions: ServiceSuggestion[];
  loading?: boolean;
  onAddSuggestion?: (suggestion: ServiceSuggestion) => void;
}

export default function MinaSuggestionsCard({
  suggestions,
  loading,
  onAddSuggestion,
}: MinaSuggestionsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Gợi ý dịch vụ (AI Mina)</h3>
        </div>
        <p className="text-sm text-gray-500">Chưa có gợi ý nào</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">Ưu tiên cao</span>;
      case "medium":
        return <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">Ưu tiên trung bình</span>;
      default:
        return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Ưu tiên thấp</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">Gợi ý dịch vụ (AI Mina)</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg ${getPriorityColor(suggestion.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{suggestion.serviceName}</h4>
                <p className="text-sm text-gray-600">{suggestion.reason}</p>
              </div>
              {getPriorityBadge(suggestion.priority)}
            </div>
            {onAddSuggestion && (
              <button
                onClick={() => onAddSuggestion(suggestion)}
                className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Thêm vào lịch hẹn
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

