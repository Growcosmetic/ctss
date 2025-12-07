// ============================================
// Customer360 Invoice List
// ============================================

"use client";

import React from "react";
import { Receipt, Calendar, MapPin, Scissors, Package, DollarSign } from "lucide-react";
import type { CustomerInvoiceHistory } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CustomerInvoiceListProps {
  invoices: CustomerInvoiceHistory[];
}

export function CustomerInvoiceList({ invoices }: CustomerInvoiceListProps) {
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "EEEE, dd MMMM yyyy", { locale: vi });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  const formatShortDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Lịch sử hóa đơn
            </h3>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          Chưa có hóa đơn nào
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Lịch sử hóa đơn
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {invoices.length} {invoices.length === 1 ? "hóa đơn" : "hóa đơn"}
        </span>
      </div>

      <div className="space-y-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50"
          >
            {/* Header: Date, Branch, Total */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(inv.date)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatShortDate(inv.date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{inv.branchName}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-bold text-xl">
                    {inv.total.toLocaleString("vi-VN")}
                  </span>
                </div>
                <span className="text-xs text-gray-500">VND</span>
              </div>
            </div>

            {/* Items List */}
            {inv.items && inv.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                  Chi tiết ({inv.items.length} {inv.items.length === 1 ? "mục" : "mục"})
                </div>
                <div className="space-y-2">
                  {inv.items.map((item) => {
                    const isService = item.type === "SERVICE";
                    const Icon = isService ? Scissors : Package;
                    const typeColor = isService
                      ? "text-purple-600 bg-purple-50 border-purple-200"
                      : "text-blue-600 bg-blue-50 border-blue-200";

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <div
                            className={`p-1.5 rounded border ${typeColor}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border ${typeColor}`}
                              >
                                {isService ? "Dịch vụ" : "Sản phẩm"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="font-semibold text-gray-900">
                            {item.amount.toLocaleString("vi-VN")}₫
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
