"use client";

import React from "react";
import { Calendar, Receipt, Scissors } from "lucide-react";
import { Customer } from "../types";
import { format } from "date-fns";

interface CustomerHistoryProps {
  customer: Customer;
}

export default function CustomerHistory({ customer }: CustomerHistoryProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Lịch hẹn gần đây
        </h4>
        {customer.bookings && customer.bookings.length > 0 ? (
          <div className="space-y-2">
            {customer.bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">
                      {formatDate(booking.bookingDate)}
                    </p>
                    {booking.serviceName && (
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.serviceName}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Trạng thái: {booking.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">
                      {Number(booking.totalAmount).toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Chưa có lịch hẹn</p>
        )}
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Hóa đơn gần đây
        </h4>
        {customer.invoices && customer.invoices.length > 0 ? (
          <div className="space-y-2">
            {customer.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">
                      {formatDate(invoice.createdAt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {invoice.paymentMethod || "N/A"} • {invoice.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {Number(invoice.total).toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Chưa có hóa đơn</p>
        )}
      </div>

      {/* Recent Services */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Scissors className="w-4 h-4" />
          Dịch vụ đã sử dụng
        </h4>
        {customer.recentServices && customer.recentServices.length > 0 ? (
          <div className="space-y-2">
            {customer.recentServices.map((service, index) => (
              <div
                key={service.serviceId || index}
                className="p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{service.serviceName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Đã dùng {service.count} lần • Lần cuối: {formatDate(service.lastUsed)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Chưa sử dụng dịch vụ nào</p>
        )}
      </div>
    </div>
  );
}

