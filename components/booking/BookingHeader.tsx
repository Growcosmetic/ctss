"use client";

import React, { useState } from "react";
import { Calendar, Filter, Plus, X, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format, startOfWeek, endOfWeek, isToday, isSameDay } from "date-fns";

interface BookingStats {
  todayTotal: number;
  todayPending: number;
  todayInProgress: number;
  todayCompleted: number;
}

interface BookingHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedStylists: string[];
  onStylistsChange: (stylistIds: string[]) => void;
  selectedService: string;
  onServiceChange: (serviceId: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onCreateBooking: () => void;
  stylists: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string }>;
  bookingList?: Array<{ date: string; status: string }>;
  stats?: BookingStats;
}

export default function BookingHeader({
  selectedDate,
  onDateChange,
  selectedStylists,
  onStylistsChange,
  selectedService,
  onServiceChange,
  selectedStatus,
  onStatusChange,
  onCreateBooking,
  stylists,
  services,
  bookingList = [],
  stats,
}: BookingHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Quick filter handlers
  const handleTodayClick = () => {
    onDateChange(new Date());
  };

  const handleThisWeekClick = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    onDateChange(weekStart);
  };

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "IN_PROGRESS", label: "Đang thực hiện" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  const handleStylistToggle = (stylistId: string) => {
    if (selectedStylists.includes(stylistId)) {
      onStylistsChange(selectedStylists.filter((id) => id !== stylistId));
    } else {
      onStylistsChange([...selectedStylists, stylistId]);
    }
  };

  const isTodaySelected = isToday(selectedDate);

  return (
    <div className="mb-6">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Tổng hôm nay</p>
                <p className="text-xl font-bold text-gray-900">{stats.todayTotal}</p>
              </div>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-yellow-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Chờ xác nhận</p>
                <p className="text-xl font-bold text-yellow-600">{stats.todayPending}</p>
              </div>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-green-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Đang thực hiện</p>
                <p className="text-xl font-bold text-green-600">{stats.todayInProgress}</p>
              </div>
              <Clock className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Hoàn thành</p>
                <p className="text-xl font-bold text-gray-600">{stats.todayCompleted}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Booking</h1>
          
          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTodayClick}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isTodaySelected
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={handleThisWeekClick}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Tuần này
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDateChange(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => onDateChange(new Date(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
            />
            <button
              onClick={() => onDateChange(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
            <span className="text-sm text-gray-600">
              {format(selectedDate, "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            style={{
              backgroundColor: showFilters ? "#A4E3E3" : "white",
            }}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Bộ lọc</span>
          </button>
          <button
            onClick={onCreateBooking}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: "#A4E3E3", color: "#0c4a6e" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#6CCAC4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#A4E3E3";
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tạo lịch mới</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div
          className="p-4 rounded-lg border border-gray-200 mb-4"
          style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stylist Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stylist
              </label>
              <div className="flex flex-wrap gap-2">
                {stylists.map((stylist) => (
                  <button
                    key={stylist.id}
                    onClick={() => handleStylistToggle(stylist.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedStylists.includes(stylist.id)
                        ? "text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    style={
                      selectedStylists.includes(stylist.id)
                        ? { backgroundColor: "#A4E3E3", color: "#0c4a6e" }
                        : {}
                    }
                  >
                    {stylist.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dịch vụ
              </label>
              <select
                value={selectedService}
                onChange={(e) => onServiceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] bg-white"
              >
                <option value="all">Tất cả dịch vụ</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

