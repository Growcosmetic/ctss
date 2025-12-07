// ============================================
// Customer360 Notes Card
// ============================================

"use client";

import React from "react";
import { StickyNote, FileText, MessageSquare } from "lucide-react";

interface CustomerNotesCardProps {
  notes: string[];
}

export function CustomerNotesCard({ notes }: CustomerNotesCardProps) {
  if (!notes || notes.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Ghi chú tư vấn</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Chưa có ghi chú nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Ghi chú tư vấn</h3>
        {notes && notes.length > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {notes.length}
          </span>
        )}
      </div>

      {notes && notes.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
          {notes.map((note, index) => (
            <div
              key={index}
              className="relative p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 text-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="flex-1 leading-relaxed whitespace-pre-wrap">{note}</p>
              </div>
              <div className="absolute top-2 right-2 text-xs text-gray-400">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

