"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
  stylists: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string; duration: number }>;
  selectedDate?: Date;
  selectedTime?: string;
  isWalkIn?: boolean; // Walk-in mode
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
  isWalkIn = false,
}: CreateBookingModalProps) {
  // Calculate current time rounded to nearest 30 minutes for walk-in
  const getCurrentTimeRounded = () => {
    const now = new Date();
    const roundedMinutes = Math.floor(now.getMinutes() / 30) * 30;
    return `${now.getHours().toString().padStart(2, "0")}:${roundedMinutes.toString().padStart(2, "0")}`;
  };

  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    phone: "",
    stylistId: stylists[0]?.id || "",
    serviceId: services[0]?.id || "",
    date: selectedDate ? selectedDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    time: isWalkIn ? getCurrentTimeRounded() : (selectedTime || "09:00"),
    notes: isWalkIn ? "Khách vãng lai" : "",
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
        time: isWalkIn ? getCurrentTimeRounded() : (selectedTime || "09:00"),
        notes: isWalkIn ? "Khách vãng lai" : "",
      });
    }
  }, [isOpen, selectedDate, selectedTime, stylists, services, isWalkIn]);

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setIsCheckingConflict(true);

    try {
      // Check conflicts via API before submitting
      const response = await fetch("/api/bookings/check-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: formData.stylistId,
          bookingDate: formData.date,
          bookingTime: formData.time,
          duration: duration,
          bufferTime: 10, // Default 10 minutes
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 409) {
          setConflictError(error.error || "Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.");
          setIsCheckingConflict(false);
          return;
        }
        throw new Error(error.error || "Failed to check conflicts");
      }

      // No conflicts, proceed with submission
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
      setConflictError(null);
      // Close modal
      onClose();
    } catch (error: any) {
      setConflictError(error.message || "Có lỗi xảy ra khi kiểm tra lịch hẹn");
    } finally {
      setIsCheckingConflict(false);
    }
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isWalkIn ? "Khách vãng lai" : "Tạo lịch hẹn mới"}
      size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Hủy
          </Button>
          <Button
            variant="primary"
            disabled={isCheckingConflict}
            isLoading={isCheckingConflict}
            className="flex-1"
            type="submit"
            form="booking-form"
          >
            Lưu
          </Button>
        </div>
      }
    >
      <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Name */}
        <Input
          label="Tên khách hàng *"
          type="text"
          required
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          placeholder="Nhập tên khách hàng"
        />

        {/* Phone */}
        <Input
          label="Số điện thoại *"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Nhập số điện thoại"
        />

        {/* Stylist */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stylist *
          </label>
          <select
            required
            value={formData.stylistId}
            onChange={(e) => setFormData({ ...formData, stylistId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white"
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
          <div className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 bg-primary-50">
            <Clock className="w-4 h-4 text-primary-600" />
            <span className="text-gray-700 font-medium">{duration} phút</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Thời lượng tự động theo dịch vụ đã chọn
          </p>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ngày *"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            label="Giờ bắt đầu *"
            type="time"
            required
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
            placeholder="Nhập ghi chú (nếu có)"
          />
        </div>

        {/* Conflict Error Display */}
        {conflictError && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-700 text-sm font-medium">⚠️ Cảnh báo</p>
            <p className="text-danger-600 text-sm mt-1">{conflictError}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
