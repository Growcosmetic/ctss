"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { DateRange } from "../types";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (dateRange: DateRange) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ startDate: e.target.value, endDate });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ startDate, endDate: e.target.value });
  };

  const setToday = () => {
    const today = new Date().toISOString().split("T")[0];
    onChange({ startDate: today, endDate: today });
  };

  const setThisWeek = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1); // Monday
    const end = new Date(today);
    end.setDate(start.getDate() + 6); // Sunday

    onChange({
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
  };

  const setThisMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    onChange({
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
  };

  const setLastMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);

    onChange({
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Khoảng thời gian:</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">đến</span>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={setToday}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Hôm nay
          </button>
          <button
            onClick={setThisWeek}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Tuần này
          </button>
          <button
            onClick={setThisMonth}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Tháng này
          </button>
          <button
            onClick={setLastMonth}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Tháng trước
          </button>
        </div>
      </div>
    </div>
  );
}

