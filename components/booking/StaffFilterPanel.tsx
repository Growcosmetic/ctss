"use client";

import React, { useState, useMemo } from "react";
import { User, ChevronDown, ChevronUp } from "lucide-react";

interface StaffFilterPanelProps {
  stylists: Array<{
    id: string;
    name: string;
    role?: string;
    group?: string;
  }>;
  selectedStylists: string[];
  onStylistsChange: (stylistIds: string[]) => void;
  bookingList?: Array<{
    date: string;
    stylistId?: string;
  }>;
  selectedDate: Date;
}

export default function StaffFilterPanel({
  stylists,
  selectedStylists,
  onStylistsChange,
  bookingList = [],
  selectedDate,
}: StaffFilterPanelProps) {
  const [showAll, setShowAll] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const selectedDateStr = selectedDate.toISOString().split("T")[0];

  // Calculate booking count for each stylist
  const stylistBookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    stylists.forEach((st) => {
      counts[st.id] = bookingList.filter(
        (b) => b.date === selectedDateStr && b.stylistId === st.id
      ).length;
    });
    return counts;
  }, [bookingList, selectedDateStr, stylists]);

  // Group stylists by role/group if available
  const groupedStylists = useMemo(() => {
    const groups: Record<string, typeof stylists> = {};
    const ungrouped: typeof stylists = [];

    stylists.forEach((st) => {
      const group = st.group || st.role || "Khác";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(st);
    });

    return { groups, ungrouped };
  }, [stylists]);

  const handleSelectAll = () => {
    if (selectedStylists.length === stylists.length) {
      onStylistsChange([]);
    } else {
      onStylistsChange(stylists.map((s) => s.id));
    }
  };

  const handleUnselectedStaff = () => {
    // Filter bookings without stylist
    const bookingsWithoutStylist = bookingList.filter(
      (b) => b.date === selectedDateStr && !b.stylistId
    );
    // This is a special filter - you might want to handle it differently
    // For now, we'll just toggle it
    onStylistsChange([]);
  };

  const handleStylistToggle = (stylistId: string) => {
    if (selectedStylists.includes(stylistId)) {
      onStylistsChange(selectedStylists.filter((id) => id !== stylistId));
    } else {
      onStylistsChange([...selectedStylists, stylistId]);
    }
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const allSelected = selectedStylists.length === stylists.length;
  const someSelected = selectedStylists.length > 0 && selectedStylists.length < stylists.length;

  return (
    <div
      className="w-56 bg-white rounded-xl shadow-sm border border-gray-200 h-fit max-h-[calc(100vh-200px)] flex flex-col"
      style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">Nhân viên</h3>
          <button
            onClick={() => setShowAll(!showAll)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {showAll ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Dropdown "Tất cả" */}
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] text-sm bg-white"
          value="all"
          onChange={(e) => {
            if (e.target.value === "all") {
              handleSelectAll();
            }
          }}
        >
          <option value="all">Tất cả</option>
        </select>
      </div>

      {/* Staff List */}
      {showAll && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {/* Chọn Toàn Bộ */}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#A4E3E3] border-gray-300 rounded focus:ring-[#A4E3E3]"
                style={{
                  accentColor: "#A4E3E3",
                }}
              />
              <span className="text-sm font-medium text-gray-900">
                Chọn Toàn Bộ
              </span>
            </label>

            {/* Chưa Chọn Nhân Viên */}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={selectedStylists.length === 0}
                onChange={handleUnselectedStaff}
                className="w-4 h-4 border-gray-300 rounded focus:ring-[#A4E3E3]"
                style={{
                  accentColor: "#A4E3E3",
                }}
              />
              <span className="text-sm text-gray-700">
                Chưa Chọn Nhân Viên
              </span>
            </label>

            {/* Staff List */}
            <div className="space-y-1 mt-3">
              {stylists.map((stylist) => {
                const isSelected = selectedStylists.includes(stylist.id);
                const bookingCount = stylistBookingCounts[stylist.id] || 0;
                const group = stylist.group || stylist.role || "";

                return (
                  <div
                    key={stylist.id}
                    className="group relative"
                    title={`${stylist.name}${group ? ` - ${group}` : ""}`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-white/70 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStylistToggle(stylist.id)}
                        className="w-4 h-4 border-gray-300 rounded focus:ring-[#A4E3E3]"
                        style={{
                          accentColor: "#A4E3E3",
                        }}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-[#A4E3E3] rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {stylist.name}
                          </p>
                          {group && (
                            <p className="text-xs text-gray-500 truncate">
                              {group}
                            </p>
                          )}
                        </div>
                        {bookingCount > 0 && (
                          <span className="text-xs font-medium text-[#0c4a6e] bg-[#A4E3E3] px-2 py-0.5 rounded-full flex-shrink-0">
                            {bookingCount}
                          </span>
                        )}
                      </div>
                    </label>

                    {/* Tooltip on hover */}
                    <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
                      <p className="font-medium">{stylist.name}</p>
                      {group && <p className="text-gray-300">{group}</p>}
                      {bookingCount > 0 && (
                        <p className="text-gray-300 mt-1">
                          {bookingCount} lịch hôm nay
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

