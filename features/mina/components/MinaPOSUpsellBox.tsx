"use client";

import React, { useEffect } from "react";
import { Sparkles, Plus, X } from "lucide-react";
import { useMina } from "../hooks/useMina";
import { InvoiceDraft, POSUpsellSuggestion } from "../types";

interface MinaPOSUpsellBoxProps {
  invoiceDraft: InvoiceDraft;
  onAddSuggestion?: (suggestion: POSUpsellSuggestion) => void;
}

export default function MinaPOSUpsellBox({
  invoiceDraft,
  onAddSuggestion,
}: MinaPOSUpsellBoxProps) {
  const { loading, posUpsellSuggestions, getPOSUpsellSuggestions } = useMina();

  useEffect(() => {
    if (invoiceDraft.items && invoiceDraft.items.length > 0) {
      getPOSUpsellSuggestions(invoiceDraft);
    }
  }, [invoiceDraft]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!posUpsellSuggestions || posUpsellSuggestions.length === 0) {
    return null;
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

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900">💡 Gợi ý từ AI Mina</h4>
      </div>

      <div className="space-y-2">
        {posUpsellSuggestions.slice(0, 3).map((suggestion, index) => (
          <div
            key={index}
            className={`p-3 border rounded-lg ${getPriorityColor(suggestion.priority)} flex items-center justify-between`}
          >
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">{suggestion.name}</p>
              <p className="text-xs text-gray-600 mt-1">{suggestion.reason}</p>
            </div>
            {onAddSuggestion && (
              <button
                onClick={() => onAddSuggestion(suggestion)}
                className="ml-3 flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Thêm
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

