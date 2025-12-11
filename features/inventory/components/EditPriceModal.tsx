"use client";

import React, { useState } from "react";
import { ProductStock } from "../types";
import { X, DollarSign } from "lucide-react";

interface EditPriceModalProps {
  stock: ProductStock;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPriceModal({ stock, isOpen, onClose, onSuccess }: EditPriceModalProps) {
  const [costPrice, setCostPrice] = useState(stock.product?.costPrice?.toString() || "");
  const [pricePerUnit, setPricePerUnit] = useState(stock.product?.pricePerUnit?.toString() || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`/api/inventory/product/${stock.productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          costPrice: costPrice ? parseFloat(costPrice) : null,
          pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể cập nhật giá");
      }

      alert("Cập nhật giá thành công!");
      onSuccess();
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Sửa giá TB</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sản phẩm
            </label>
            <p className="text-gray-900">{stock.product?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá nhập TB (₫) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              min="0"
              step="1000"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập giá nhập trung bình"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá bán (₫)
            </label>
            <input
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập giá bán"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
