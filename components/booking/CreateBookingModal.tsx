"use client";

import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
  stylists: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string; duration: number }>;
  selectedDate?: Date;
  selectedTime?: string;
}

export interface BookingFormData {
  customerName: string;
  phone: string;
  stylistId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

export default function CreateBookingModal({
  isOpen,
  onClose,
  onSubmit,
  stylists,
  services,
  selectedDate,
  selectedTime,
}: CreateBookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    phone: "",
    stylistId: stylists[0]?.id || "",
    serviceId: services[0]?.id || "",
    date: selectedDate ? selectedDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    time: selectedTime || "09:00",
    notes: "",
  });

  // Get selected service duration
  const selectedService = services.find((s) => s.id === formData.serviceId);
  const duration = selectedService?.duration || 30;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        customerName: "",
        phone: "",
        stylistId: stylists[0]?.id || "",
        serviceId: services[0]?.id || "",
        date: selectedDate ? selectedDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        time: selectedTime || "09:00",
        notes: "",
      });
    }
  }, [isOpen, selectedDate, selectedTime, stylists, services]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      customerName: "",
      phone: "",
      stylistId: stylists[0]?.id || "",
      serviceId: services[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      notes: "",
    });
    // Close modal
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      customerName: "",
      phone: "",
      stylistId: stylists[0]?.id || "",
      serviceId: services[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      notes: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between"
          style={{
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <h2 className="text-xl font-bold text-gray-900">Tạo lịch hẹn mới</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên khách hàng *
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] transition-all"
              placeholder="Nhập tên khách hàng"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] transition-all"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Stylist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stylist *
            </label>
            <select
              required
              value={formData.stylistId}
              onChange={(e) => setFormData({ ...formData, stylistId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] transition-all bg-white"
            >
              {stylists.map((stylist) => (
                <option key={stylist.id} value={stylist.id}>
                  {stylist.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dịch vụ *
            </label>
            <select
              required
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] transition-all bg-white"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Duration (Auto-calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời lượng
            </label>
            <div
              className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: "rgba(164, 227, 227, 0.1)" }}
            >
              <Clock className="w-4 h-4" style={{ color: "#A4E3E3" }} />
              <span className="text-gray-700 font-medium">{duration} phút</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Thời lượng tự động theo dịch vụ đã chọn
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ bắt đầu *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] transition-all resize-none"
              placeholder="Nhập ghi chú (nếu có)"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all"
              style={{
                backgroundColor: "#A4E3E3",
                color: "#0c4a6e",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#6CCAC4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#A4E3E3";
              }}
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
