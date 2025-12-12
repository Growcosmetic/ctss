"use client";

import React, { useState } from "react";
import { Package, TrendingDown, TrendingUp, AlertTriangle, Image as ImageIcon, Edit, MoreVertical, MapPin } from "lucide-react";
import { ProductStock } from "../types";
import { cn } from "@/lib/utils";
import { formatUnit } from "@/core/inventory/productUnits";
import StockActionMenu from "./StockActionMenu";
import { useBranch } from "@/features/branches/hooks/useBranch";

interface StockListViewProps {
  stocks: ProductStock[];
  onEdit?: (stock: ProductStock) => void;
  onAssignLocation?: (stock: ProductStock) => void;
  onRefresh?: () => void;
}

export default function StockListView({ stocks, onEdit, onAssignLocation, onRefresh }: StockListViewProps) {
  const { currentBranch } = useBranch();
  const [selectedStocks, setSelectedStocks] = useState<Set<string>>(new Set());
  const getStockStatus = (stock: ProductStock) => {
    const quantity = stock.quantity;
    const minLevel = stock.minLevel || 0;
    const maxLevel = stock.maxLevel || null;

    if (quantity <= 0) return { text: "Hết hàng", color: "text-red-600 bg-red-50", severity: "critical" };
    if (minLevel > 0 && quantity <= minLevel) return { text: "Sắp hết", color: "text-yellow-600 bg-yellow-50", severity: "warning" };
    if (maxLevel && quantity >= maxLevel) return { text: "Đầy", color: "text-green-600 bg-green-50", severity: "normal" };
    return { text: "Sẵn sàng", color: "text-green-600 bg-green-50", severity: "normal" };
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const toggleSelectStock = (stockId: string) => {
    const newSelected = new Set(selectedStocks);
    if (newSelected.has(stockId)) {
      newSelected.delete(stockId);
    } else {
      newSelected.add(stockId);
    }
    setSelectedStocks(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedStocks.size === stocks.length) {
      setSelectedStocks(new Set());
    } else {
      setSelectedStocks(new Set(stocks.map(s => s.id)));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectedStocks.size === stocks.length && stocks.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                Tên sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhãn hiệu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chi nhánh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đ.Vị
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá nhập TB
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có sản phẩm nào trong kho</p>
                </td>
              </tr>
            ) : (
              stocks.map((stock) => {
                const status = getStockStatus(stock);
                const isLow = (stock.minLevel || 0) > 0 && stock.quantity <= (stock.minLevel || 0);
                const isCritical = stock.quantity <= 0;
                const isNegative = stock.quantity < 0;
                const isSelected = selectedStocks.has(stock.id);

                return (
                  <tr
                    key={stock.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      isCritical && "bg-red-50/30",
                      isLow && !isCritical && "bg-yellow-50/30",
                      isNegative && "bg-red-100/50",
                      isSelected && "bg-blue-50/50"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectStock(stock.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* Image */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    </td>
                    
                    {/* Product Name */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {stock.product?.sku ? (
                            <span>
                              <span className="font-mono text-gray-600">{stock.product.sku}</span>
                              {stock.product?.name && ` ${stock.product.name}`}
                            </span>
                          ) : (
                            stock.product?.name || "Unknown Product"
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Brand */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {stock.product?.supplier?.name || stock.product?.brand || "N/A"}
                      </span>
                    </td>
                    
                    {/* Branch */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {currentBranch?.name || stock.branch?.name || "N/A"}
                      </span>
                    </td>
                    
                    {/* Unit */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stock.product?.unit || "N/A"}
                      </div>
                    </td>
                    
                    {/* Stock Quantity */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLow && !isCritical && (
                          <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium">
                            Sắp hết
                          </span>
                        )}
                        {isCritical && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 font-medium">
                            Hết hàng
                          </span>
                        )}
                        {isNegative && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-200 text-red-900 font-medium">
                            Bị âm
                          </span>
                        )}
                        <span className={cn(
                          "text-sm font-semibold",
                          isCritical ? "text-red-600" : isLow ? "text-yellow-600" : isNegative ? "text-red-800" : "text-gray-900"
                        )}>
                          {stock.quantity.toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </td>
                    
                    {/* Average Cost Price */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        (stock.product?.costPrice || 0) === 0 ? "text-gray-400" : "text-gray-900"
                      )}>
                        {formatPrice(stock.product?.costPrice || 0)}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <StockActionMenu stock={stock} onRefresh={onRefresh} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
