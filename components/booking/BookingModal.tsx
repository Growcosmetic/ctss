"use client";

import React, { useState, useEffect, useMemo } from "react";
import { addDuration, bookingsOverlap } from "@/utils/bookingUtils";
import { useBestSlot } from "@/hooks/useBestSlot";
import CheckoutModal from "@/features/pos/components/CheckoutModal";
import CustomerProfile from "@/features/crm/components/CustomerProfile";
import { useMina } from "@/features/mina/hooks/useMina";
import { ShoppingCart, User, AlertCircle } from "lucide-react";

export default function BookingModal({
  booking,
  stylists,
  onClose,
  onSave,
  onDelete,
  bookingList,
}: any) {
  const [customerName, setCustomerName] = useState(booking.customerName);
  const [serviceName, setServiceName] = useState(booking.serviceName);
  const [stylistId, setStylistId] = useState(booking.stylistId);
  const [date, setDate] = useState(booking.date);
  const [start, setStart] = useState(booking.start);
  const [duration, setDuration] = useState(booking.duration);
  const [end, setEnd] = useState(booking.end);

  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);

  const { getAvailableSlots } = useBestSlot();
  const { returnPrediction, getPredictReturn } = useMina();

  // Note: In production, you'd need to fetch customerId from phone first
  // For now, this is a placeholder - the prediction would be loaded when customerId is available

  // =============================
  // GET AVAILABLE SLOTS
  // =============================
  const availableSlots = useMemo(() => {
    return getAvailableSlots(bookingList, date, stylistId, duration);
  }, [bookingList, date, stylistId, duration]);

  // =============================
  // AUTO UPDATE END TIME WHEN START CHANGES
  // =============================
  useEffect(() => {
    const newEnd = addDuration(start, duration);
    setEnd(newEnd);
  }, [start, duration]);

  // =============================
  // CONFLICT CHECK
  // =============================
  const conflictBooking = useMemo(() => {
    return bookingList.find((b: any) => {
      if (b.id === booking.id) return false; // skip itself
      if (b.date !== date) return false;
      if (b.stylistId !== stylistId) return false;

      const bStart = b.start || b.time;
      const bEnd = b.end || addDuration(bStart, b.duration);

      return bookingsOverlap(
        { start, end },
        { start: bStart, end: bEnd }
      );
    });
  }, [bookingList, date, stylistId, start, end, duration]);

  // =============================
  // AUTO SHOW ERROR
  // =============================
  useEffect(() => {
    if (conflictBooking) {
      setError(
        `❌ Bị trùng với lịch: ${conflictBooking.customerName} (${conflictBooking.start}–${conflictBooking.end})`
      );
    } else {
      setError(null);
    }
  }, [conflictBooking]);

  const handleSave = () => {
    if (error) return;

    const updated = {
      ...booking,
      customerName,
      serviceName,
      stylistId,
      date,
      start,
      end,
      duration,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[380px]">

        <h2 className="text-xl font-semibold mb-4">Chỉnh sửa lịch hẹn</h2>

        {/* CUSTOMER */}
        <label className="block mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Khách hàng</span>
            {booking.phone && (
              <button
                onClick={() => setShowCustomerProfile(true)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                Xem hồ sơ
              </button>
            )}
          </div>
          <input
            className="w-full p-2 border rounded mt-1"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          {booking.phone && (
            <p className="text-xs text-gray-500 mt-1">{booking.phone}</p>
          )}
        </label>

        {/* STYLIST */}
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Stylist</span>
          <select
            className="w-full p-2 border rounded mt-1"
            value={stylistId}
            onChange={(e) => setStylistId(e.target.value)}
          >
            {stylists.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        {/* DATE */}
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Ngày</span>
          <input
            type="date"
            className="w-full p-2 border rounded mt-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        {/* START TIME */}
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Giờ bắt đầu</span>
          <input
            type="time"
            className={`w-full p-2 border rounded mt-1 ${
              error ? "border-red-500 bg-red-50" : ""
            }`}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>

        {/* DURATION */}
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Thời lượng (phút)</span>
          <input
            type="number"
            className="w-full p-2 border rounded mt-1"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>

        {/* END TIME (readonly) */}
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Giờ kết thúc</span>
          <input
            disabled
            className="w-full p-2 border rounded bg-gray-100 mt-1"
            value={end}
          />
        </label>

        {/* GỢI Ý SLOT TRỐNG */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">⏱ Gợi ý giờ trống</p>

          {availableSlots.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Không có khung giờ trống phù hợp</p>
          ) : (
            availableSlots.map((s: any) => (
              <div
                key={s.start}
                className="p-2 bg-blue-50 border rounded mt-2 cursor-pointer hover:bg-blue-100"
                onClick={() => {
                  setStart(s.start);
                  setEnd(s.end);
                }}
              >
                <div>Giờ đẹp: {s.start} → {s.end}</div>
                <div className="text-xs text-gray-500">{s.note}</div>
              </div>
            ))
          )}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="p-2 text-sm text-red-600 bg-red-100 rounded mb-3">
            {error}
          </div>
        )}

        {/* MINA Prediction Warning - Show if booking is overdue */}
        {returnPrediction && booking.date && (() => {
          try {
            const bookingDate = new Date(booking.date);
            const predictedDate = new Date(returnPrediction.predictedDate);
            const daysDiff = Math.floor((bookingDate.getTime() - predictedDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 30) {
              return (
                <div className="p-3 text-sm bg-yellow-50 border border-yellow-200 rounded-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-800">
                    ⚠️ Khách quá hạn quay lại dự kiến ({Math.round(daysDiff)} ngày)
                  </span>
                </div>
              );
            }
          } catch (e) {
            // Ignore date parsing errors
          }
          return null;
        })()}

        {/* ACTIONS */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => onDelete(booking.id)}
            className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
          >
            Xóa
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCheckout(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Thanh toán
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Hủy
            </button>

            <button
              onClick={handleSave}
              disabled={!!error}
              className={`px-4 py-2 rounded text-white ${
                error
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Lưu
            </button>
          </div>
        </div>

      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          bookingId={booking.id}
          customerName={customerName}
          customerPhone={booking.phone}
          stylists={stylists}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            // Refresh booking status after payment
            onSave({ ...booking, status: "COMPLETED" });
            setShowCheckout(false);
          }}
        />
      )}

      {/* Customer Profile Modal */}
      {showCustomerProfile && booking.phone && (
        <CustomerProfile
          customerPhone={booking.phone}
          onClose={() => setShowCustomerProfile(false)}
        />
      )}
    </div>
  );
}
