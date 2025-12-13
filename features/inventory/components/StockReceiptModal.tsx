"use client";

import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, Plus, Trash2, Loader2, Save, Minus, Percent, FileSpreadsheet } from "lucide-react";
import SupplierSelector from "./SupplierSelector";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  costPrice: number | null;
}

interface ReceiptItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
  notes?: string;
}

interface StockReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  branchId: string;
  receiptId?: string;
}

export default function StockReceiptModal({
  isOpen,
  onClose,
  onSuccess,
  branchId,
  receiptId,
}: StockReceiptModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  
  const [formData, setFormData] = useState({
    supplierId: null as string | null,
    date: new Date().toISOString().split("T")[0],
    dateTime: new Date().toISOString().slice(0, 16),
    notes: "",
    importType: "NHAP_MUA_TU_NCC" as "NHAP_MUA_TU_NCC" | "NHAP_HANG_TRA_LAI" | "NHAP_DONG_GOI",
    status: "DRAFT" as "DRAFT" | "APPROVED" | "COMPLETED" | "CANCELLED",
    totalDiscount: 0,
    discountPercent: 0,
  });

  const [items, setItems] = useState<ReceiptItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      if (receiptId) {
        loadReceipt();
      } else {
        setFormData({
          supplierId: null,
          date: new Date().toISOString().split("T")[0],
          dateTime: new Date().toISOString().slice(0, 16),
          notes: "",
          importType: "NHAP_MUA_TU_NCC",
          status: "DRAFT",
          totalDiscount: 0,
          discountPercent: 0,
        });
        setItems([]);
      }
    }
  }, [isOpen, receiptId]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/inventory/product/list?isActive=true", {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProducts(result.products || []);
        }
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadReceipt = async () => {
    if (!receiptId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/inventory/receipts/${receiptId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const receipt = result.data;
          setFormData({
            supplierId: receipt.supplierId,
            date: new Date(receipt.date).toISOString().split("T")[0],
            dateTime: new Date(receipt.date).toISOString().slice(0, 16),
            notes: receipt.notes || "",
            importType: receipt.importType || "NHAP_MUA_TU_NCC",
            status: receipt.status,
            totalDiscount: receipt.totalDiscount || 0,
            discountPercent: receipt.discountPercent || 0,
          });
          setItems(
            receipt.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountPercent: item.discountPercent || 0,
              discountAmount: item.discountAmount || 0,
              totalPrice: item.totalPrice,
              notes: item.notes || "",
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error loading receipt:", error);
      setError("Không thể tải phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        discountAmount: 0,
        totalPrice: 0,
        notes: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === "productId") {
      item.productId = value;
      const product = products.find((p) => p.id === value);
      if (product && product.costPrice) {
        item.unitPrice = product.costPrice;
      }
      // Recalculate after price change
      const subtotal = item.quantity * item.unitPrice;
      if (item.discountPercent > 0) {
        // If discount was set by percentage, recalculate amount
        item.discountAmount = (subtotal * item.discountPercent) / 100;
      }
      item.totalPrice = Math.max(0, subtotal - item.discountAmount);
    } else if (field === "quantity") {
      item.quantity = Number(value) || 0;
      // Recalculate after quantity change
      const subtotal = item.quantity * item.unitPrice;
      if (item.discountPercent > 0) {
        // If discount was set by percentage, recalculate amount
        item.discountAmount = (subtotal * item.discountPercent) / 100;
      }
      item.totalPrice = Math.max(0, subtotal - item.discountAmount);
    } else if (field === "unitPrice") {
      item.unitPrice = Number(value) || 0;
      // Recalculate after price change
      const subtotal = item.quantity * item.unitPrice;
      if (item.discountPercent > 0) {
        // If discount was set by percentage, recalculate amount
        item.discountAmount = (subtotal * item.discountPercent) / 100;
      }
      item.totalPrice = Math.max(0, subtotal - item.discountAmount);
    } else if (field === "discountPercent") {
      item.discountPercent = Number(value) || 0;
      const subtotal = item.quantity * item.unitPrice;
      // Calculate discount amount from percentage
      item.discountAmount = (subtotal * item.discountPercent) / 100;
      item.totalPrice = Math.max(0, subtotal - item.discountAmount);
    } else if (field === "discountAmount") {
      item.discountAmount = Number(value) || 0;
      const subtotal = item.quantity * item.unitPrice;
      // Calculate discount percentage from amount
      item.discountPercent = subtotal > 0 ? (item.discountAmount / subtotal) * 100 : 0;
      item.totalPrice = Math.max(0, subtotal - item.discountAmount);
    } else {
      (item as any)[field] = value;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + itemSubtotal;
    }, 0);
  }, [items]);

  const itemDiscounts = useMemo(() => {
    return items.reduce((sum, item) => sum + item.discountAmount, 0);
  }, [items]);

  const totalDiscount = useMemo(() => {
    const afterItemDiscount = subtotal - itemDiscounts;
    if (formData.discountPercent > 0) {
      return (afterItemDiscount * formData.discountPercent) / 100;
    }
    return formData.totalDiscount;
  }, [subtotal, itemDiscounts, formData.discountPercent, formData.totalDiscount]);

  const finalAmount = useMemo(() => {
    // Công thức: Tổng giá trị nhập = (Tổng giá sản phẩm) - (Giảm giá từng sản phẩm) - (Giảm giá toàn bộ)
    const result = subtotal - itemDiscounts - totalDiscount;
    return Math.max(0, result); // Đảm bảo không âm
  }, [subtotal, itemDiscounts, totalDiscount]);

  const applyTotalDiscount = () => {
    // Discount already calculated in useMemo
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError("Vui lòng thêm ít nhất một sản phẩm");
      return;
    }

    for (const item of items) {
      if (!item.productId || item.quantity <= 0 || item.unitPrice === null || item.unitPrice === undefined || item.unitPrice < 0) {
        setError("Vui lòng điền đầy đủ thông tin cho tất cả sản phẩm (productId, quantity > 0, unitPrice >= 0)");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const url = receiptId
        ? `/api/inventory/receipts/${receiptId}`
        : "/api/inventory/receipts";
      const method = receiptId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          branchId,
          supplierId: formData.supplierId,
          importType: formData.importType,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice) || 0, // Đảm bảo luôn là số
            discountPercent: item.discountPercent || 0,
            discountAmount: item.discountAmount || 0,
            notes: item.notes || null,
          })),
          date: formData.dateTime || formData.date,
          notes: formData.notes || null,
          status: formData.status,
          totalDiscount: totalDiscount,
          discountPercent: formData.discountPercent,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể lưu phiếu nhập");
      }

      alert(`✅ ${receiptId ? "Cập nhật" : "Tạo"} phiếu nhập thành công!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error saving receipt:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: "Phiếu nhập đang xử lý",
      APPROVED: "Phiếu nhập đã duyệt",
      COMPLETED: "Phiếu nhập đã hoàn thành",
      CANCELLED: "Phiếu nhập đã hủy",
    };
    return labels[status] || status;
  };

  const getImportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      NHAP_MUA_TU_NCC: "Nhập mua từ NCC",
      NHAP_HANG_TRA_LAI: "Nhập hàng trả lại từ KH",
      NHAP_DONG_GOI: "Nhập đóng gói",
    };
    return labels[type] || type;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={receiptId ? "Sửa phiếu nhập kho" : "Tạo phiếu nhập kho"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Header Info - 2 Columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã phiếu nhập
              </label>
              <input
                type="text"
                value="<tự động sinh mã phiếu>"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Được tạo bởi
              </label>
              <input
                type="text"
                value="Hệ thống"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập vào kho <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={branchId}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ghi chú về phiếu nhập..."
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "DRAFT" | "APPROVED" | "COMPLETED" | "CANCELLED",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">{getStatusLabel("DRAFT")}</option>
                <option value="APPROVED">{getStatusLabel("APPROVED")}</option>
                <option value="COMPLETED">{getStatusLabel("COMPLETED")}</option>
                <option value="CANCELLED">{getStatusLabel("CANCELLED")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhà cung cấp
              </label>
              <SupplierSelector
                value={formData.supplierId}
                onChange={(id) => setFormData({ ...formData, supplierId: id })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => {
                  const dt = e.target.value;
                  setFormData({
                    ...formData,
                    dateTime: dt,
                    date: dt.split("T")[0],
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phân loại nhập <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.importType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    importType: e.target.value as "NHAP_MUA_TU_NCC" | "NHAP_HANG_TRA_LAI" | "NHAP_DONG_GOI",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="NHAP_MUA_TU_NCC">{getImportTypeLabel("NHAP_MUA_TU_NCC")}</option>
                <option value="NHAP_HANG_TRA_LAI">{getImportTypeLabel("NHAP_HANG_TRA_LAI")}</option>
                <option value="NHAP_DONG_GOI">{getImportTypeLabel("NHAP_DONG_GOI")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Search and Add */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Button>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Sản phẩm <span className="text-red-500">*</span>
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Giá
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Số lượng
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Giảm giá
                    <span className="text-xs font-normal text-gray-500 block mt-1">
                      (Áp dụng cho từng sản phẩm: % hoặc số tiền)
                    </span>
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Tổng tiền
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 px-3 py-2">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, "productId", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Tìm kiếm sản phẩm</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku ? `${p.sku} - ` : ""}{p.name} ({p.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateItem(index, "quantity", Math.max(1, item.quantity - 1))}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => updateItem(index, "quantity", item.quantity + 1)}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discountPercent}
                            onChange={(e) => updateItem(index, "discountPercent", e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0 %"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discountAmount}
                            onChange={(e) => updateItem(index, "discountAmount", e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0 ₫"
                          />
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="font-semibold">
                          {item.totalPrice.toLocaleString("vi-VN")} ₫
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          = ({item.quantity} × {item.unitPrice.toLocaleString("vi-VN")}) - {item.discountAmount.toLocaleString("vi-VN")}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Total Discount */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Giảm giá toàn bộ
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Áp dụng giảm giá cho toàn bộ đơn hàng sau khi đã trừ giảm giá từng sản phẩm. 
                Dùng khi nhà cung cấp có chương trình khuyến mãi theo tổng giá trị đơn hàng.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.discountPercent}
              onChange={(e) => {
                const percent = Number(e.target.value) || 0;
                setFormData({
                  ...formData,
                  discountPercent: percent,
                  totalDiscount: percent > 0 ? ((subtotal - itemDiscounts) * percent) / 100 : 0,
                });
              }}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0 %"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalDiscount}
              onChange={(e) => {
                const amount = Number(e.target.value) || 0;
                const afterItemDiscount = subtotal - itemDiscounts;
                const percent = afterItemDiscount > 0 ? (amount / afterItemDiscount) * 100 : 0;
                setFormData({
                  ...formData,
                  totalDiscount: amount,
                  discountPercent: percent,
                });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0 ₫"
            />
            <Button
              type="button"
              onClick={applyTotalDiscount}
              variant="outline"
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
            >
              Áp dụng
            </Button>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">TỔNG GIÁ TRỊ NHẬP</div>
            <div className="text-2xl font-bold text-blue-700">
              {finalAmount.toLocaleString("vi-VN")} ₫
            </div>
            {totalDiscount > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              (Tổng SP: {subtotal.toLocaleString("vi-VN")} ₫ - Giảm SP: {itemDiscounts.toLocaleString("vi-VN")} ₫ - Giảm toàn bộ: {totalDiscount.toLocaleString("vi-VN")} ₫)
            </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Nhập từ Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          {!receiptId && (
            <Button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                const form = e.currentTarget.closest("form");
                if (form) {
                  const formDataCopy = { ...formData, status: "DRAFT" };
                  setFormData(formDataCopy);
                  // Create a synthetic submit event
                  const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
                  form.dispatchEvent(submitEvent);
                }
              }}
              disabled={loading}
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu Nháp
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {receiptId ? "Cập nhật" : "Hoàn Thành"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
