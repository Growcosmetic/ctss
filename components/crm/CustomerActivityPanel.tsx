"use client";

import React, { useState } from "react";
import { Calendar, ShoppingBag, CreditCard, Heart, Bell, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import CustomerPhotosTab from "./CustomerPhotosTab";

interface CustomerActivityPanelProps {
  customerId: string | null;
}

export default function CustomerActivityPanel({ customerId }: CustomerActivityPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["appointments", "orders"]));

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (!customerId) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center h-[calc(100vh-72px)]">
        <div className="text-center text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Chọn khách hàng để xem lịch sử</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-[calc(100vh-72px)]">
      <Tabs defaultValue="history" className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1">L.Sử giao dịch</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1">Ảnh Khách Hàng</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="history" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Lịch hẹn sắp tới */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("appointments")}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  <span className="font-medium text-gray-900">Lịch hẹn sắp tới</span>
                </div>
                {expandedSections.has("appointments") ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("appointments") && (
                <div className="p-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">* Xem lịch hẹn cũ - 6 tháng gần đây</p>
                  <div className="text-sm text-gray-600">Chưa có lịch hẹn</div>
                </div>
              )}
            </div>

            {/* Đơn hàng đã thực hiện */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("orders")}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-green-500" />
                  <span className="font-medium text-gray-900">Đơn hàng đã thực hiện (0)</span>
                </div>
                {expandedSections.has("orders") ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("orders") && (
                <div className="p-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Chưa có đơn hàng</div>
                </div>
              )}
            </div>

            {/* Các lần trả tiền */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("payments")}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-purple-500" />
                  <span className="font-medium text-gray-900">Các lần trả tiền (0)</span>
                </div>
                {expandedSections.has("payments") ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("payments") && (
                <div className="p-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Chưa có lần trả tiền</div>
                </div>
              )}
            </div>

            {/* Thẻ dịch vụ */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("cards")}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-orange-500" />
                  <span className="font-medium text-gray-900">Thẻ dịch vụ của khách</span>
                </div>
                {expandedSections.has("cards") ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("cards") && (
                <div className="p-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Chưa có thẻ dịch vụ</div>
                </div>
              )}
            </div>

            {/* Dịch vụ yêu thích */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("favorites")}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-red-500" />
                  <span className="font-medium text-gray-900">Dịch vụ & Sản phẩm yêu thích (0)</span>
                </div>
                {expandedSections.has("favorites") ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("favorites") && (
                <div className="p-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Chưa có dịch vụ yêu thích</div>
                </div>
              )}
            </div>

            {/* Nhắc nhở */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("reminders")}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-yellow-500" />
                  <span className="font-medium text-gray-900">Nhắc nhở chưa thực hiện</span>
                </div>
                {expandedSections.has("reminders") ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("reminders") && (
                <div className="p-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Chưa có nhắc nhở</div>
                  <a href="#" className="text-blue-600 text-sm hover:underline">Xem toàn bộ</a>
                </div>
              )}
            </div>

            {/* Hồ sơ ghi chú */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("notes")}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-gray-500" />
                  <span className="font-medium text-gray-900">Hồ sơ ghi chú</span>
                </div>
                {expandedSections.has("notes") ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("notes") && (
                <div className="p-3 border-t border-gray-200">
                  <a href="#" className="text-blue-600 text-sm hover:underline">Xem chi tiết</a>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="flex-1 overflow-y-auto p-4">
          <CustomerPhotosTab customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

