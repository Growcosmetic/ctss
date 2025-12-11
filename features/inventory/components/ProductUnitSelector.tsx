"use client";

import React from "react";
import { COUNTING_UNIT_OPTIONS, CAPACITY_UNIT_OPTIONS } from "@/core/inventory/productUnits";

interface ProductUnitSelectorProps {
  countingUnit: string;
  capacity?: number | null;
  capacityUnit?: string | null;
  onCountingUnitChange: (unit: string) => void;
  onCapacityChange: (capacity: number | null) => void;
  onCapacityUnitChange: (unit: string | null) => void;
  disabled?: boolean;
}

export default function ProductUnitSelector({
  countingUnit,
  capacity,
  capacityUnit,
  onCountingUnitChange,
  onCapacityChange,
  onCapacityUnitChange,
  disabled = false,
}: ProductUnitSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Đơn vị đếm */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đơn vị đếm <span className="text-red-500">*</span>
        </label>
        <select
          value={countingUnit}
          onChange={(e) => onCountingUnitChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">-- Chọn đơn vị đếm --</option>
          {COUNTING_UNIT_OPTIONS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Các loại: Ống, Chai, Hủ, Lọ, Túi, Hộp, Cái, Gói, Bộ, Cuộn, Tờ, Lon, Thùng...
        </p>
      </div>

      {/* Dung tích / Số lượng */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dung tích / Số lượng
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={capacity || ""}
            onChange={(e) => {
              const value = e.target.value;
              onCapacityChange(value === "" ? null : parseFloat(value));
            }}
            placeholder="15"
            min="0"
            step="0.01"
            disabled={disabled}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <select
            value={capacityUnit || ""}
            onChange={(e) => onCapacityUnitChange(e.target.value || null)}
            disabled={disabled}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Chọn đơn vị --</option>
            {CAPACITY_UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Các loại: ml, l, g, kg, mg, cl, dl (để trống nếu không có dung tích)
        </p>
      </div>

      {/* Preview */}
      {(countingUnit || capacity) && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Xem trước:</p>
          <p className="text-sm font-medium text-blue-900">
            {countingUnit || "Chưa chọn"}
            {capacity && capacityUnit && ` (${capacity}${capacityUnit})`}
          </p>
        </div>
      )}
    </div>
  );
}
