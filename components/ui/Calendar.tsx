"use client";

import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  className,
  minDate,
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days before month start to fill the first week
  const firstDayOfWeek = monthStart.getDay();
  const daysBefore = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - firstDayOfWeek + i);
    return date;
  });

  // Get days after month end to fill the last week
  const lastDayOfWeek = monthEnd.getDay();
  const daysAfter = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...daysBefore, ...daysInMonth, ...daysAfter];

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousMonth}
          className="p-2"
        >
          <ChevronLeft size={20} />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy", { locale: vi })}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="p-2"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {allDays.map((date, idx) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isDisabled = isDateDisabled(date);

          return (
            <button
              key={idx}
              onClick={() => {
                if (!isDisabled && onDateSelect) {
                  onDateSelect(date);
                }
              }}
              disabled={isDisabled}
              className={cn(
                "aspect-square text-sm rounded-lg transition-colors",
                isCurrentMonth
                  ? "text-gray-900 hover:bg-gray-100"
                  : "text-gray-400",
                isSelected && "bg-primary-600 text-white hover:bg-primary-700",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {format(date, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
};

