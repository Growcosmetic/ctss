"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/features/customer-app/hooks/useCustomerAuth";
import { getCustomerBookings } from "@/features/customer-app/services/customerApi";
import { CustomerBooking } from "@/features/customer-app/types";
import CustomerNavBar from "@/features/customer-app/components/CustomerNavBar";
import { Calendar, Clock, Scissors, User, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

function BookingsContent() {
  const { authenticated, loading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "upcoming";

  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">(
    status === "history" ? "history" : "upcoming"
  );

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push("/customer-app/login");
      return;
    }

    if (authenticated) {
      loadBookings();
    }
  }, [authenticated, authLoading, activeTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getCustomerBookings(activeTab);
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
          <h1 className="text-2xl font-bold">Lịch hẹn của tôi</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === "upcoming"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-500"
            }`}
          >
            Sắp tới
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === "history"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-500"
            }`}
          >
            Lịch sử
          </button>
        </div>

        {/* Bookings List */}
        <div className="p-4 space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                {activeTab === "upcoming"
                  ? "Chưa có lịch hẹn sắp tới"
                  : "Chưa có lịch sử"}
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const bookingDateTime = new Date(booking.bookingTime);
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {format(bookingDateTime, "EEEE, dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 ml-6">
                        {format(bookingDateTime, "HH:mm")} • {booking.duration} phút
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "COMPLETED"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Scissors className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {booking.services.map((s) => s.name).join(", ")}
                      </span>
                    </div>

                    {booking.stylist && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          Stylist: {booking.stylist.name}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tổng cộng:</span>
                      <span className="font-semibold text-gray-900">
                        {booking.totalAmount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>

                  {activeTab === "upcoming" && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() =>
                          router.push(`/customer-app/bookings/${booking.id}`)
                        }
                        className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition"
                      >
                        Chi tiết
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <CustomerNavBar />
    </>
  );
}

export default function CustomerBookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}

