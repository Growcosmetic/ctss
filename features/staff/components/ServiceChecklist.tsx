"use client";

import React, { useState, useEffect } from "react";
import { ServiceChecklist as ChecklistType, ServiceChecklistItem } from "../types";
import { getServiceTemplate } from "../services/serviceTemplates";
import { CheckCircle, Circle } from "lucide-react";

interface ServiceChecklistProps {
  bookingId: string;
  serviceName: string;
  serviceId: string;
  checklist: ChecklistType | null;
  onSave: (checklist: ChecklistType) => void;
  loading?: boolean;
}

export default function ServiceChecklist({
  bookingId,
  serviceName,
  serviceId,
  checklist,
  onSave,
  loading,
}: ServiceChecklistProps) {
  const [items, setItems] = useState<ServiceChecklistItem[]>([]);

  // Initialize checklist from saved or template
  useEffect(() => {
    if (checklist && checklist.items) {
      setItems(checklist.items);
    } else {
      // Create from template
      const template = getServiceTemplate(serviceName);
      const newItems: ServiceChecklistItem[] = template.map((label, index) => ({
        id: `item-${index}`,
        label,
        completed: false,
        order: index,
      }));
      setItems(newItems);
    }
  }, [checklist, serviceName]);

  // Auto-save on change
  useEffect(() => {
    if (items.length > 0) {
      const saveTimeout = setTimeout(() => {
        const checklistData: ChecklistType = {
          bookingId,
          serviceId,
          items,
        };
        onSave(checklistData);
      }, 1000); // Debounce 1 second

      return () => clearTimeout(saveTimeout);
    }
  }, [items, bookingId, serviceId, onSave]);

  const toggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Checklist dịch vụ</h3>
        <div className="text-sm text-gray-600">
          {completedCount}/{totalCount} hoàn thành
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          {progressPercentage}%
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              item.completed
                ? "bg-green-50 border-green-300 text-gray-700"
                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-900"
            }`}
          >
            {item.completed ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <span
              className={`text-sm flex-1 text-left ${
                item.completed ? "line-through opacity-60" : ""
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Đang lưu...
        </div>
      )}
    </div>
  );
}

