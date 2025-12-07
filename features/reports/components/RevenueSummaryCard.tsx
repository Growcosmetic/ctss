"use client";

import React from "react";
import { DollarSign, Receipt, Percent, CreditCard } from "lucide-react";
import { RevenueSummary } from "../types";

interface RevenueSummaryCardProps {
  summary: RevenueSummary | null;
  loading?: boolean;
}

export default function RevenueSummaryCard({
  summary,
  loading,
}: RevenueSummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan doanh thu</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Revenue */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Tổng doanh thu</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {summary.totalRevenue.toLocaleString("vi-VN")} đ
          </p>
        </div>

        {/* Total Invoices */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Số hóa đơn</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{summary.totalInvoices}</p>
        </div>

        {/* Total Discount */}
        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Tổng giảm giá</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {summary.totalDiscount.toLocaleString("vi-VN")} đ
          </p>
        </div>

        {/* Payment Methods */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Phương thức thanh toán</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Tiền mặt:</span>
              <span className="font-medium">
                {summary.revenueByPaymentMethod.CASH.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between">
              <span>Chuyển khoản:</span>
              <span className="font-medium">
                {summary.revenueByPaymentMethod.TRANSFER.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between">
              <span>Thẻ:</span>
              <span className="font-medium">
                {summary.revenueByPaymentMethod.CARD.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between">
              <span>Khác:</span>
              <span className="font-medium">
                {summary.revenueByPaymentMethod.OTHER.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

