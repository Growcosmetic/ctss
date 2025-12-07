"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingCart, Percent, CreditCard, Sparkles } from "lucide-react";
import { usePOS } from "../hooks/usePOS";
import ServiceSelector from "./ServiceSelector";
import ProductSelector from "./ProductSelector";
import StaffSelector from "./StaffSelector";
import { PaymentMethod } from "../types";
import { fakeStylists } from "@/lib/data/fakeStylists";
import CustomerProfile from "@/features/crm/components/CustomerProfile";
import MinaPOSUpsellBox from "@/features/mina/components/MinaPOSUpsellBox";
import { InvoiceDraft, POSUpsellSuggestion } from "@/features/mina/types";
import LoyaltyPanel from "@/features/loyalty/components/LoyaltyPanel";
import { useCustomer360 } from "@/features/customer360/hooks/useCustomer360";

interface CheckoutModalProps {
  bookingId: string;
  customerName?: string;
  customerPhone?: string;
  stylists?: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CheckoutModal({
  bookingId,
  customerName,
  customerPhone,
  stylists = fakeStylists,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const {
    loading,
    error,
    invoice,
    invoiceItems,
    discountAmount,
    paymentMethod,
    subtotal,
    total,
    addItem,
    removeItem,
    updateQuantity,
    updateStaff,
    setDiscount,
    setPaymentMethod,
    loadInvoice,
    saveDraft,
    confirmPayment,
  } = usePOS();

  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showStaffSelector, setShowStaffSelector] = useState(false);
  const [selectedItemForStaff, setSelectedItemForStaff] = useState<string | null>(null);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Load invoice on mount
  useEffect(() => {
    loadInvoice(bookingId);
  }, [bookingId]);

  // Get customerId from invoice
  useEffect(() => {
    if (invoice?.customerId) {
      setCustomerId(invoice.customerId);
    }
  }, [invoice]);

  // Load Customer360 data
  const { data: customer360Data } = useCustomer360(customerId || "");

  const handleAddService = (service: { id: string; name: string; price: number }) => {
    addItem({
      serviceId: service.id,
      quantity: 1,
      unitPrice: service.price,
    });
  };

  const handleAddProduct = (product: { id: string; name: string; price: number }) => {
    addItem({
      productId: product.id,
      quantity: 1,
      unitPrice: product.price,
    });
  };

  const handleSelectStaff = (staffId: string) => {
    if (selectedItemForStaff) {
      updateStaff(selectedItemForStaff, staffId);
      setSelectedItemForStaff(null);
    }
  };

  const handleSaveDraft = async () => {
    await saveDraft(bookingId);
    if (!error) {
      alert("Đã lưu nháp thành công!");
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    await confirmPayment(bookingId);
    if (!error) {
      alert("Thanh toán thành công!");
      onSuccess?.();
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Thanh toán</h2>
              {customerName && (
                <p className="text-sm text-gray-500 mt-1">
                  Khách hàng:{" "}
                  {customerPhone ? (
                    <button
                      onClick={() => setShowCustomerProfile(true)}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      {customerName} - {customerPhone}
                    </button>
                  ) : (
                    customerName
                  )}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Add Items Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowServiceSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Thêm dịch vụ
              </button>
              <button
                onClick={() => setShowProductSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="w-4 h-4" />
                Thêm sản phẩm
              </button>
            </div>

            {/* Customer360 AI Summary */}
            {customer360Data && customerId && (
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Gợi ý từ Customer 360°
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  {customer360Data.insights && (
                    <>
                      <div>
                        <span className="font-medium">Khả năng quay lại:</span>{" "}
                        {customer360Data.insights.returnLikelihood}%
                      </div>
                      {customer360Data.insights.nextService && (
                        <div>
                          <span className="font-medium">Gợi ý dịch vụ tiếp theo:</span>{" "}
                          {customer360Data.insights.nextService}
                        </div>
                      )}
                      {customer360Data.customer360?.loyalty && (
                        <div>
                          <span className="font-medium">Điểm loyalty:</span>{" "}
                          {customer360Data.customer360.loyalty.totalPoints} điểm
                        </div>
                      )}
                      {customer360Data.insights.churnRisk && (
                        <div>
                          <span className="font-medium">Rủi ro rời bỏ:</span>{" "}
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              customer360Data.insights.churnRisk === "HIGH"
                                ? "bg-red-100 text-red-700"
                                : customer360Data.insights.churnRisk === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {customer360Data.insights.churnRisk}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* MINA POS Upsell Suggestions */}
            {invoiceItems.length > 0 && (
              <MinaPOSUpsellBox
                invoiceDraft={{
                  items: invoiceItems.map((item) => ({
                    serviceId: item.serviceId || undefined,
                    productId: item.productId || undefined,
                    name: item.service?.name || item.product?.name || "N/A",
                  })),
                  customerId: invoice?.customerId,
                }}
                onAddSuggestion={(suggestion) => {
                  // Add suggestion to invoice items
                  if (suggestion.serviceId) {
                    // For now, add with default price - in production, fetch actual price
                    addItem({
                      serviceId: suggestion.serviceId,
                      quantity: 1,
                      unitPrice: 0, // Should fetch actual price from service
                    });
                  } else if (suggestion.productId) {
                    addItem({
                      productId: suggestion.productId,
                      quantity: 1,
                      unitPrice: 0, // Should fetch actual price from product
                    });
                  }
                }}
              />
            )}

            {/* Invoice Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Danh sách dịch vụ/sản phẩm
              </h3>
              {invoiceItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                  Chưa có dịch vụ/sản phẩm nào
                </div>
              ) : (
                <div className="space-y-3">
                  {invoiceItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.service?.name || item.product?.name || "N/A"}
                        </p>
                        {item.staffId && (
                          <p className="text-sm text-gray-500">
                            Nhân viên:{" "}
                            {item.staff
                              ? `${item.staff.user.firstName} ${item.staff.user.lastName}`
                              : stylists.find((s) => s.id === item.staffId)?.name || "N/A"}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItemForStaff(item.id);
                              setShowStaffSelector(true);
                            }}
                            className="ml-4 px-3 py-1 text-sm border rounded hover:bg-blue-50"
                          >
                            {item.staffId ? "Đổi NV" : "Chọn NV"}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {item.unitPrice.toLocaleString("vi-VN")} đ × {item.quantity}
                          </p>
                          <p className="font-semibold text-lg">
                            {item.lineTotal.toLocaleString("vi-VN")} đ
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Giảm giá
              </h3>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                placeholder="Nhập số tiền giảm giá"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            {/* Loyalty Panel */}
            {customerId && (
              <div className="mb-6">
                <LoyaltyPanel
                  customerId={customerId}
                  onApplyTierDiscount={(discountPercent) => {
                    // Apply tier discount to discountAmount
                    const tierDiscount = (subtotal * discountPercent) / 100;
                    setDiscount(discountAmount + tierDiscount);
                  }}
                />
              </div>
            )}

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Phương thức thanh toán
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(PaymentMethod).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 border rounded-lg text-left transition ${
                      paymentMethod === method
                        ? "border-blue-600 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-medium">{method}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">{subtotal.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="font-medium text-red-600">
                    -{discountAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{total.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <button
              onClick={handleSaveDraft}
              disabled={loading || invoiceItems.length === 0}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lưu nháp
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading || invoiceItems.length === 0 || !paymentMethod}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showServiceSelector && (
        <ServiceSelector
          onSelect={handleAddService}
          onClose={() => setShowServiceSelector(false)}
        />
      )}
      {showProductSelector && (
        <ProductSelector
          onSelect={handleAddProduct}
          onClose={() => setShowProductSelector(false)}
        />
      )}
      {showStaffSelector && (
        <StaffSelector
          stylists={stylists}
          onSelect={handleSelectStaff}
          onClose={() => {
            setShowStaffSelector(false);
            setSelectedItemForStaff(null);
          }}
        />
      )}

      {/* Customer Profile Modal */}
      {showCustomerProfile && customerPhone && (
        <CustomerProfile
          customerPhone={customerPhone}
          onClose={() => setShowCustomerProfile(false)}
        />
      )}
    </>
  );
}

