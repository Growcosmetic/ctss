"use client";

import React, { useState, useEffect } from "react";
import { Filter, Calendar, Tag, Users } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface AdvancedFilters {
  membershipStatus?: string[];
  dateFrom?: string;
  dateTo?: string;
  source?: string[];
  customerGroup?: string[];
}

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedFilters) => void;
  currentFilters: AdvancedFilters;
}

const MEMBERSHIP_OPTIONS = [
  { value: "Hạng Thường", label: "Hạng Thường" },
  { value: "Hạng Bạc", label: "Hạng Bạc" },
  { value: "Hạng Vàng", label: "Hạng Vàng" },
  { value: "VIP", label: "VIP" },
  { value: "Vãng lai", label: "Vãng lai" },
];

const SOURCE_OPTIONS = [
  { value: "Facebook", label: "Facebook" },
  { value: "Zalo", label: "Zalo" },
  { value: "Website", label: "Website" },
  { value: "Walk-in", label: "Walk-in" },
  { value: "Giới thiệu", label: "Giới thiệu" },
  { value: "Khác", label: "Khác" },
];

export default function AdvancedFilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: AdvancedFilterModalProps) {
  const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const handleToggleMembership = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      membershipStatus: prev.membershipStatus?.includes(value)
        ? prev.membershipStatus.filter((v) => v !== value)
        : [...(prev.membershipStatus || []), value],
    }));
  };

  const handleToggleSource = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      source: prev.source?.includes(value)
        ? prev.source.filter((v) => v !== value)
        : [...(prev.source || []), value],
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: AdvancedFilters = {};
    setFilters(clearedFilters);
    onApply(clearedFilters);
    onClose();
  };

  const hasActiveFilters = 
    (filters.membershipStatus && filters.membershipStatus.length > 0) ||
    (filters.source && filters.source.length > 0) ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.customerGroup && filters.customerGroup.length > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bộ lọc nâng cao"
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!hasActiveFilters}
            className="flex-1"
          >
            Xóa bộ lọc
          </Button>
          <Button variant="primary" onClick={handleApply} className="flex-1">
            Áp dụng
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
          {/* Membership Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Tag className="w-4 h-4 inline mr-1" />
              Trạng thái membership
            </label>
            <div className="flex flex-wrap gap-2">
              {MEMBERSHIP_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleToggleMembership(option.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.membershipStatus?.includes(option.value)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-1" />
              Ngày tạo tài khoản
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nguồn khách hàng
            </label>
            <div className="flex flex-wrap gap-2">
              {SOURCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleToggleSource(option.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.source?.includes(option.value)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Group */}
          <div>
            <Input
              label="Nhóm khách hàng"
              type="text"
              placeholder="Nhập tên nhóm (tùy chọn)"
              value={filters.customerGroup?.join(", ") || ""}
              onChange={(e) => {
                const groups = e.target.value.split(",").map((g) => g.trim()).filter(Boolean);
                setFilters({
                  ...filters,
                  customerGroup: groups.length > 0 ? groups : undefined,
                });
              }}
              helperText="Có thể nhập nhiều nhóm, phân cách bằng dấu phẩy"
            />
          </div>
      </div>
    </Modal>
  );
}

