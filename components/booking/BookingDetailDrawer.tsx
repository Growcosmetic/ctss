"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Scissors,
  Calendar,
  Clock,
  Edit,
  Save,
  Printer,
  MessageCircle,
  MapPin,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { format } from "date-fns";
import { fakeStylists } from "@/lib/data/fakeStylists";
import { fakeServices } from "@/lib/data/fakeServices";
import { getCustomer } from "@/features/crm/services/crmApi";

interface BookingDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    customerName: string;
    phone: string;
    serviceName: string;
    stylistId?: string;
    stylistName?: string;
    date: string;
    time: string;
    duration: number;
    status: "CONFIRMED" | "PENDING" | "CANCELLED" | "IN_PROGRESS" | "COMPLETED" | "WAITING" | "NO_SHOW" | "confirmed" | "pending" | "cancelled";
    notes?: string;
  } | null;
  bookingList: Array<{
    id: string;
    customerName: string;
    phone?: string;
    stylistId: string;
    date: string;
    start: string;
    end: string;
    [key: string]: any;
  }>;
  setBookingList: (bookings: any[]) => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onChangeStylist?: (newStylistId: string) => void;
  onViewHistory?: () => void;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chưa xác nhận", color: "bg-yellow-500" },
  { value: "CONFIRMED", label: "Đã xác nhận", color: "bg-blue-500" },
  { value: "WAITING", label: "Chờ phục vụ", color: "bg-orange-500" },
  { value: "IN_PROGRESS", label: "Đang phục vụ", color: "bg-green-500" },
  { value: "CANCELLED", label: "Hủy lịch", color: "bg-red-500" },
  { value: "NO_SHOW", label: "Không đến", color: "bg-red-500" },
  { value: "COMPLETED", label: "Hoàn thành", color: "bg-gray-500" },
];

export default function BookingDetailDrawer({
  isOpen,
  onClose,
  booking,
  bookingList,
  setBookingList,
  onEdit,
  onCancel,
  onChangeStylist,
  onViewHistory,
}: BookingDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [appointmentType, setAppointmentType] = useState<"advance" | "walkin">("advance");

  useEffect(() => {
    if (booking) {
      const [hour, minute] = booking.time.split(":").map(Number);
      setFormData({
        customerName: booking.customerName,
        phone: booking.phone,
        date: booking.date,
        hour: hour,
        minute: minute,
        duration: booking.duration,
        notes: booking.notes || "",
        guestCount: 1,
        serviceId: fakeServices.find((s) => s.name === booking.serviceName)?.id || "",
        stylistId: booking.stylistId || "",
        roomId: "",
        branchId: "",
      });
    }
  }, [booking]);

  if (!isOpen || !booking || !formData) return null;

  const handleSave = () => {
    const updatedBooking = {
      ...booking,
      customerName: formData.customerName,
      phone: formData.phone,
      date: formData.date,
      time: `${formData.hour.toString().padStart(2, "0")}:${formData.minute.toString().padStart(2, "0")}`,
      duration: formData.duration,
      notes: formData.notes,
      serviceName: fakeServices.find((s) => s.id === formData.serviceId)?.name || booking.serviceName,
      stylistId: formData.stylistId,
    };

    setBookingList(
      bookingList.map((b) => (b.id === booking.id ? updatedBooking : b))
    );
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: string) => {
    setBookingList(
      bookingList.map((b) =>
        b.id === booking.id ? { ...b, status: newStatus.toUpperCase() as any } : b
      )
    );
  };

  const currentStatus = booking.status.toUpperCase();

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer - 2 columns */}
      <div
        className={`absolute right-0 top-0 h-full bg-white transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: "900px",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Lịch hẹn (Mã đặt lịch: {booking.id.slice(0, 10).toUpperCase()})
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Tạo bởi lúc {format(new Date(), "HH:mm dd/MM/yyyy")} Tạo bởi: Admin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - 2 columns */}
        <div className="flex h-[calc(100vh-180px)] overflow-hidden">
          {/* Left Column - Form */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-gray-200">
            <div className="space-y-6">
              {/* Booking ID */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Mã đặt lịch
                </label>
                <p className="text-sm text-gray-900 font-mono">{booking.id.slice(0, 10).toUpperCase()}</p>
              </div>

              {/* Customer Info */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Khách hàng
                </label>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold text-gray-900">{booking.customerName}</p>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Khách quay lại
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] text-sm"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">{booking.phone}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Quận 1 - TP Hồ Chí Minh</span>
                    </div>
                    <button className="flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline">
                      <Info className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointment Time */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Giờ hẹn
                </label>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <select
                        value={formData.hour}
                        onChange={(e) => setFormData({ ...formData, hour: Number(e.target.value) })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i} giờ
                          </option>
                        ))}
                      </select>
                      <select
                        value={formData.minute}
                        onChange={(e) => setFormData({ ...formData, minute: Number(e.target.value) })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                      >
                        {[0, 15, 30, 45].map((m) => (
                          <option key={m} value={m}>
                            {m} phút
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <span className="text-base font-semibold text-gray-900">
                      {booking.time}
                    </span>
                  )}
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                    />
                  ) : (
                    <span className="text-base font-semibold text-gray-900 ml-2">
                      {format(new Date(booking.date), "dd-MM-yyyy")}
                    </span>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Thời gian dự kiến
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] w-24"
                    />
                    <span className="text-sm text-gray-600">phút</span>
                  </div>
                ) : (
                  <p className="text-base font-semibold text-gray-900">{booking.duration} phút</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Ghi chú
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {booking.notes || "Không có ghi chú"}
                  </p>
                )}
              </div>

              {/* Guest Count */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Số lượng khách
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3] w-24"
                    min={1}
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-900">1</p>
                )}
              </div>

              {/* Service */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Dịch vụ
                </label>
                {isEditing ? (
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                  >
                    <option value="">Chọn các dịch vụ</option>
                    {fakeServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-base font-semibold text-gray-900">{booking.serviceName}</p>
                )}
              </div>

              {/* Staff */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nhân viên phục vụ
                </label>
                {isEditing ? (
                  <select
                    value={formData.stylistId}
                    onChange={(e) => setFormData({ ...formData, stylistId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                  >
                    <option value="">Chọn nhân viên</option>
                    {fakeStylists.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {booking.stylistName || "Chưa chọn"}
                  </p>
                )}
              </div>

              {/* Room/Seat */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Phòng/Chỗ ngồi
                </label>
                {isEditing ? (
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                  >
                    <option value="">Chọn vị trí</option>
                    <option value="room-1">Phòng 1</option>
                    <option value="room-2">Phòng 2</option>
                    <option value="seat-1">Chỗ ngồi 1</option>
                    <option value="seat-2">Chỗ ngồi 2</option>
                  </select>
                ) : (
                  <p className="text-sm text-gray-600">Chưa chọn</p>
                )}
              </div>

              {/* Branch */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tại chi nhánh
                </label>
                {isEditing ? (
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                  >
                    <option value="branch-1">Hair Salon Chí Tâm</option>
                  </select>
                ) : (
                  <p className="text-sm text-gray-900">Hair Salon Chí Tâm</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Status Sidebar */}
          <div className="w-80 bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Appointment Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Loại đặt lịch
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAppointmentType("advance")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      appointmentType === "advance"
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Đặt lịch trước
                  </button>
                  <button
                    onClick={() => setAppointmentType("walkin")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      appointmentType === "walkin"
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Đến trực tiếp
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Trạng thái
                </label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((status) => (
                    <label
                      key={status.value}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        currentStatus === status.value
                          ? "bg-white border-2 border-blue-500 shadow-sm"
                          : "bg-white border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={currentStatus === status.value}
                        onChange={() => handleStatusChange(status.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full ${status.color} flex-shrink-0`}></div>
                      <span className="text-sm font-medium text-gray-900 flex-1">
                        {status.label}
                      </span>
                      {currentStatus === status.value && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Đặt lịch từ
                </label>
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Gọi điện
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Đóng
          </button>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Lưu thông tin
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Sửa
                </button>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Gửi tin Zalo
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  In lịch hẹn
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
