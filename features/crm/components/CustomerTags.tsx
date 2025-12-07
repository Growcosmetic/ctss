"use client";

import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { CustomerTag } from "../types";

interface CustomerTagsProps {
  tags: CustomerTag[];
  onAddTag: (label: string, color?: string) => Promise<void>;
  onRemoveTag: (tagId: string) => Promise<void>;
  loading?: boolean;
}

export default function CustomerTags({
  tags,
  onAddTag,
  onRemoveTag,
  loading,
}: CustomerTagsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");

  const handleAddTag = async () => {
    if (!newTagLabel.trim()) return;

    try {
      await onAddTag(newTagLabel.trim(), newTagColor);
      setNewTagLabel("");
      setShowAddForm(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  const predefinedColors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Tags</h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Thêm tag
        </button>
      </div>

      {showAddForm && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={newTagLabel}
            onChange={(e) => setNewTagLabel(e.target.value)}
            placeholder="Nhập tên tag..."
            className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddTag();
              }
            }}
          />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">Màu:</span>
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  newTagColor === color ? "border-gray-800" : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTag}
              disabled={loading || !newTagLabel.trim()}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Thêm
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewTagLabel("");
              }}
              className="px-3 py-1 border text-sm rounded hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Chưa có tag nào</p>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
              style={{ backgroundColor: tag.color || "#3B82F6" }}
            >
              <span>{tag.label}</span>
              <button
                onClick={() => onRemoveTag(tag.id)}
                className="hover:bg-white/20 rounded p-0.5"
                disabled={loading}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

