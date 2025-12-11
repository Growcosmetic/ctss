"use client";

import React, { useState } from "react";
import { ProductStock } from "../types";
import { X, Scale } from "lucide-react";

interface BalanceStockModalProps {
  stock: ProductStock;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BalanceStockModal({ stock, isOpen, onClose, onSuccess }: BalanceStockModalProps) {
  const [newQuantity, setNewQuantity] = useState(stock.quantity.toString());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirm(`Bạn có chắc muốn cân bằng kho từ ${stock.quantity} về ${newQuantity}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: stock.productId,
          branchId: stock.branchId,
          newQuantity: parseFloat(newQuantity),
          notes: notes || `Cân bằng kho: ${stock.quantity} → ${newQuantity}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể cân bằng kho");
      }

      alert("Cân bằng kho thành công!");
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
            <Scale className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Cân bằng kho</h2>
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
              Tồn kho hiện tại
            </label>
            <p className="text-gray-600">{stock.quantity.toLocaleString("vi-VN")} {stock.product?.unit}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng mới <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lý do cân bằng kho..."
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
              {loading ? "Đang xử lý..." : "Cân bằng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BalanceStockModal;
