// ============================================
// Stylist Coach - Technical Notes History
// ============================================

"use client";

import React from "react";
import {
  BookOpen,
  Calendar,
  Scissors,
  User,
  FileText,
  Clock,
  Thermometer,
  Beaker,
} from "lucide-react";
import type { TechnicalNote } from "../types/technicalNotes";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TechnicalNotesHistoryProps {
  summary: string;
  notes?: TechnicalNote[];
}

export function TechnicalNotesHistory({
  summary,
  notes = [],
}: TechnicalNotesHistoryProps) {
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "EEEE, dd MMMM yyyy", { locale: vi });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  const formatShortDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 space-y-4 md:space-y-6 animate-slideUp">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BookOpen className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Lịch sử kỹ thuật trước đây
        </h3>
      </div>

      {/* Summary */}
      {summary && (
        <div className="text-sm text-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-purple-900 mb-1">
                Tóm tắt dịch vụ gần nhất
              </div>
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes && notes.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="w-4 h-4" />
            <span>Chi tiết lịch sử ({notes.length} ghi chú)</span>
          </div>
          <div className="space-y-3">
            {notes.map((note, i) => (
              <div
                key={note.id || i}
                className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Scissors className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-900">
                        {note.service}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(note.date)}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatShortDate(note.date)}</span>
                      </div>
                      {note.stylistName && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{note.stylistName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200">
                  {note.formula && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Beaker className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        <span className="font-medium">Công thức:</span>{" "}
                        {note.formula}
                      </span>
                    </div>
                  )}
                  {note.lotionType && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Beaker className="w-3.5 h-3.5 text-purple-600" />
                      <span>
                        <span className="font-medium">Loại thuốc:</span>{" "}
                        {note.lotionType}
                      </span>
                    </div>
                  )}
                  {note.processingTime && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-green-600" />
                      <span>
                        <span className="font-medium">Thời gian xử lý:</span>{" "}
                        {note.processingTime}
                      </span>
                    </div>
                  )}
                  {note.neutralizerTime && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        <span className="font-medium">Thời gian trung hòa:</span>{" "}
                        {note.neutralizerTime}
                      </span>
                    </div>
                  )}
                  {note.heatTemperature && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Thermometer className="w-3.5 h-3.5 text-red-600" />
                      <span>
                        <span className="font-medium">Nhiệt độ:</span>{" "}
                        {note.heatTemperature}
                      </span>
                    </div>
                  )}
                </div>

                {/* Comment */}
                {note.comment && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <FileText className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-700">Ghi chú:</span>
                        <p className="mt-1 text-gray-600 leading-relaxed">
                          {note.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Chưa có lịch sử kỹ thuật</p>
        </div>
      )}
    </div>
  );
}

