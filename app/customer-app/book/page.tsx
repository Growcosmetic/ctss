"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/features/customer-app/hooks/useCustomerAuth";
import { createCustomerBooking } from "@/features/customer-app/services/customerApi";
import CustomerNavBar from "@/features/customer-app/components/CustomerNavBar";
import { Loader2, Check, ArrowLeft } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";

export default function CustomerBookPage() {
  const { authenticated, loading: authLoading, customer } = useCustomerAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push("/customer-app/login");
      return;
    }

    if (authenticated) {
      loadServices();
      loadStylists();
    }
  }, [authenticated, authLoading]);

  useEffect(() => {
    if (selectedDate && selectedStaffId) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedStaffId]);

  const loadServices = async () => {
    try {
      const response = await fetch("/api/services?simple=true");
      const data = await response.json();
      setServices(data.data || []);
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadStylists = async () => {
    try {
      const response = await fetch("/api/staff?simple=true");
      const data = await response.json();
      setStylists(data.data || []);
    } catch (error) {
      console.error("Error loading stylists:", error);
    }
  };

  const loadAvailableSlots = async () => {
    // Simplified: Generate time slots (8:00 - 21:00, 30-min intervals)
    const slots: string[] = [];
    for (let hour = 8; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      }
    }
    setAvailableSlots(slots);
  };

  const handleSubmit = async () => {
    if (!selectedServiceIds.length || !selectedDate || !selectedTime) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      await createCustomerBooking({
        serviceIds: selectedServiceIds,
        staffId: selectedStaffId || undefined,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
      });
      alert("Đặt lịch thành công!");
      router.push("/customer-app/bookings");
    } catch (error: any) {
      alert(error.message || "Lỗi khi đặt lịch");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-white hover:text-gray-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Đặt lịch hẹn</h1>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? "bg-pink-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? "bg-pink-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Step 1: Choose Services */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Chọn dịch vụ</h2>
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    if (selectedServiceIds.includes(service.id)) {
                      setSelectedServiceIds(
                        selectedServiceIds.filter((id) => id !== service.id)
                      );
                    } else {
                      setSelectedServiceIds([...selectedServiceIds, service.id]);
                    }
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    selectedServiceIds.includes(service.id)
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="font-semibold">{service.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {service.duration} phút •{" "}
                    {service.servicePrices?.[0]?.price?.toLocaleString("vi-VN")} đ
                  </div>
                </button>
              ))}
              <button
                onClick={() => selectedServiceIds.length > 0 && setStep(2)}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold"
              >
                Tiếp theo
              </button>
            </div>
          )}

          {/* Step 2: Choose Stylist */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">
                Chọn stylist (tùy chọn)
              </h2>
              <button
                onClick={() => setSelectedStaffId("")}
                className={`w-full p-4 rounded-xl border-2 text-left ${
                  selectedStaffId === ""
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200"
                }`}
              >
                Không chọn (Stylist tự động)
              </button>
              {stylists.map((stylist) => (
                <button
                  key={stylist.id}
                  onClick={() => setSelectedStaffId(stylist.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left ${
                    selectedStaffId === stylist.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200"
                  }`}
                >
                  {stylist.name}
                </button>
              ))}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold"
                >
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Choose Date */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Chọn ngày</h2>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const isSelected = selectedDate === dayStr;
                  return (
                    <button
                      key={dayStr}
                      onClick={() => setSelectedDate(dayStr)}
                      className={`p-3 rounded-lg border-2 ${
                        isSelected
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="text-xs text-gray-500">
                        {format(day, "EEE", { locale: vi })}
                      </div>
                      <div className="font-semibold">{format(day, "dd")}</div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => selectedDate && setStep(4)}
                  disabled={!selectedDate}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Choose Time */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Chọn giờ</h2>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`p-3 rounded-lg border-2 ${
                      selectedTime === slot
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedTime}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận đặt lịch"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <CustomerNavBar />
    </>
  );
}

