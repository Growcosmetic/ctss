"use client";

import React, { useState, useEffect } from "react";
import { FileText, Save } from "lucide-react";

interface CustomerNotesProps {
  notes: string | null | undefined;
  onSave: (notes: string) => Promise<void>;
  loading?: boolean;
}

export default function CustomerNotes({ notes, onSave, loading }: CustomerNotesProps) {
  const [editedNotes, setEditedNotes] = useState(notes || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedNotes(notes || "");
  }, [notes]);

  const handleSave = async () => {
    try {
      await onSave(editedNotes);
      setIsEditing(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Ghi chú
        </h4>
        {isEditing ? (
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            Lưu
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={editedNotes}
          onChange={(e) => setEditedNotes(e.target.value)}
          placeholder="Nhập ghi chú về khách hàng..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          rows={5}
        />
      ) : (
        <div className="text-sm text-gray-700 whitespace-pre-wrap min-h-[60px]">
          {notes || <span className="text-gray-400 italic">Chưa có ghi chú</span>}
        </div>
      )}
    </div>
  );
}

