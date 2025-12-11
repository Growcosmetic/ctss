"use client";

import React, { useEffect, useState } from "react";
import { ProductStock, StockTransaction } from "../types";
import { X, ArrowDown, ArrowUp, RotateCcw, Package } from "lucide-react";
import { getStockTransactions } from "../services/inventoryApi";

interface StockHistoryModalProps {
  stock: ProductStock;
  isOpen: boolean;
  onClose: () => void;
}

export default function StockHistoryModal({ stock, isOpen, onClose }: StockHistoryModalProps) {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && stock.branchId) {
      loadTransactions();
    }
  }, [isOpen, stock.branchId]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getStockTransactions(stock.branchId, 100);
      // Filter transactions for this product
      const productTransactions = data.filter(t => t.productId === stock.productId);
      setTransactions(productTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <ArrowDown className="w-4 h-4 text-green-600" />;
      case "OUT":
        return <ArrowUp className="w-4 h-4 text-red-600" />;
      case "ADJUST":
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      case "TRANSFER":
        return <Package className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "IN":
        return "Nhập kho";
      case "OUT":
        return "Xuất kho";
      case "ADJUST":
        return "Điều chỉnh";
      case "TRANSFER":
        return "Chuyển kho";
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lịch sử nhập xuất</h2>
            <p className="text-sm text-gray-600 mt-1">{stock.product?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Đang tải...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có lịch sử giao dịch</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {getTransactionTypeLabel(transaction.type)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {transaction.reason || "Không có lý do"}
                        </div>
                        {transaction.notes && (
                          <div className="text-xs text-gray-400 mt-1">{transaction.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.type === "IN" ? "text-green-600" :
                        transaction.type === "OUT" ? "text-red-600" :
                        "text-blue-600"
                      }`}>
                        {transaction.type === "IN" ? "+" : transaction.type === "OUT" ? "-" : "±"}
                        {transaction.quantity.toLocaleString("vi-VN")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
