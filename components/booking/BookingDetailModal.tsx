"use client";

import React, { useState, useEffect } from "react";

export default function BookingDetailModal({
  booking,
  stylists,
  onClose,
  onSave,
  onDelete,
}: {
  booking: any;
  stylists: any[];
  onClose: () => void;
  onSave: (updated: any) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState({
    customerName: booking.customerName,
    phone: booking.phone || "",
    serviceName: booking.serviceName,
    stylistId: booking.stylistId,
    date: booking.date,
    start: booking.start,
    end: booking.end,
    notes: booking.notes || "",
    status: booking.status,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
  }, []);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]">
      {/* ANIMATION CONTAINER */}
      <div
        className={`bg-white rounded-xl shadow-xl p-6 w-[400px] transform transition-all duration-300
          ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}
        `}
      >
        <h2 className="text-lg font-semibold mb-4">Chi tiết Booking</h2>

        <div className="space-y-3">
          <Input label="Tên khách" value={form.customerName} onChange={(v) => updateField("customerName", v)} />
          <Input label="Số điện thoại" value={form.phone} onChange={(v) => updateField("phone", v)} />
          <Input label="Dịch vụ" value={form.serviceName} onChange={(v) => updateField("serviceName", v)} />

          {/* Stylist dropdown */}
          <div>
            <label className="text-sm font-medium">Stylist</label>
            <select
              value={form.stylistId}
              onChange={(e) => updateField("stylistId", e.target.value)}
              className="w-full border rounded-md p-2 mt-1"
            >
              {stylists.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <Input label="Ngày" type="date" value={form.date} onChange={(v) => updateField("date", v)} />

          <Input label="Bắt đầu" type="time" value={form.start} onChange={(v) => updateField("start", v)} />

          <Input label="Kết thúc" type="time" value={form.end} onChange={(v) => updateField("end", v)} />

          {/* Notes */}
          <div>
            <label className="text-sm font-medium">Ghi chú</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full border rounded-md p-2 mt-1"
              rows={3}
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full border rounded-md p-2 mt-1"
            >
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300" onClick={onClose}>
            Đóng
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={() => onDelete(booking.id)}
          >
            Xóa
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => onSave(form)}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: any;
  type?: string;
  onChange: (v: any) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md p-2 mt-1"
      />
    </div>
  );
}
