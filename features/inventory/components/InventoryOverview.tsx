"use client";

import React, { useEffect, useState } from "react";
import { useBranch } from "@/features/branches/hooks/useBranch";
import { getStockLevels, getLowStockAlerts } from "../services/inventoryApi";
import { ProductStock, LowStockAlert } from "../types";
import { Package, AlertTriangle, TrendingUp, DollarSign, Box, Loader2 } from "lucide-react";

interface InventoryOverviewProps {
  stocks: ProductStock[];
  alerts: LowStockAlert[];
  loading: boolean;
}

export default function InventoryOverview({ stocks, alerts, loading }: InventoryOverviewProps) {
  const { currentBranch } = useBranch();
  const [totalValue, setTotalValue] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);

  useEffect(() => {
    if (stocks.length > 0) {
      // Tính tổng giá trị kho
      const value = stocks.reduce((sum, stock) => {
        const costPrice = stock.product?.costPrice || stock.product?.price || 0;
        return sum + (stock.quantity * costPrice);
      }, 0);
      setTotalValue(value);

      // Tính tổng số lượng
      const quantity = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
      setTotalQuantity(quantity);

      // Đếm sản phẩm
      setTotalProducts(stocks.length);

      // Đếm cảnh báo
      setLowStockCount(alerts.length);
    }
  }, [stocks, alerts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tổng thể kho</h2>
        <p className="text-gray-600 mt-1">
          Chi nhánh: {currentBranch?.name || "Chưa chọn chi nhánh"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng giá trị kho */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng giá trị kho</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalValue.toLocaleString("vi-VN")} đ
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Tổng sản phẩm */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalProducts}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tổng số lượng */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số lượng</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalQuantity.toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Box className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Cảnh báo tồn kho thấp */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cảnh báo tồn kho thấp</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {lowStockCount}
              </p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Cảnh báo tồn kho thấp ({alerts.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.slice(0, 6).map((alert) => (
              <div
                key={alert.productId}
                className="border border-red-200 rounded-lg p-4 bg-red-50"
              >
                <p className="font-medium text-gray-900">{alert.productName}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-gray-600">
                    Tồn kho: <span className="font-semibold">{alert.currentStock}</span>
                  </p>
                  <p className="text-gray-600">
                    Mức tối thiểu: <span className="font-semibold">{alert.minLevel}</span>
                  </p>
                  <p className="text-red-600 font-medium">
                    {alert.severity === "CRITICAL" ? "Nghiêm trọng" : "Cảnh báo"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {alerts.length > 6 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Và {alerts.length - 6} sản phẩm khác...
            </p>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tóm tắt</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Sản phẩm có tồn kho</span>
            <span className="font-semibold text-gray-900">
              {stocks.filter(s => s.quantity > 0).length} / {totalProducts}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Sản phẩm hết hàng</span>
            <span className="font-semibold text-red-600">
              {stocks.filter(s => s.quantity === 0).length}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Sản phẩm có vị trí</span>
            <span className="font-semibold text-gray-900">
              {stocks.filter(s => s.locationId).length} / {totalProducts}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
