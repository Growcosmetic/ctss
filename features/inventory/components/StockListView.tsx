"use client";

import React from "react";
import { Package, TrendingDown, TrendingUp, AlertTriangle, Image as ImageIcon, Edit, MoreVertical, MapPin } from "lucide-react";
import { ProductStock } from "../types";
import { cn } from "@/lib/utils";
import { formatUnit } from "@/core/inventory/productUnits";

interface StockListViewProps {
  stocks: ProductStock[];
  onEdit?: (stock: ProductStock) => void;
  onAssignLocation?: (stock: ProductStock) => void;
}

export default function StockListView({ stocks, onEdit, onAssignLocation }: StockListViewProps) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vị trí
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn vị
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá bán
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tình trạng
              </th>
              {onEdit && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={onEdit ? 10 : 9} className="px-6 py-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có sản phẩm nào trong kho</p>
                </td>
              </tr>
            ) : (
              stocks.map((stock) => {
                const status = getStockStatus(stock);
                const isLow = (stock.minLevel || 0) > 0 && stock.quantity <= (stock.minLevel || 0);
                const isCritical = stock.quantity <= 0;

                return (
                  <tr
                    key={stock.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      isCritical && "bg-red-50/30",
                      isLow && !isCritical && "bg-yellow-50/30"
                    )}
                  >
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
                          {stock.product?.name || "Unknown Product"}
                        </div>
                        {stock.product?.sku && (
                          <div className="text-xs text-gray-500 mt-1">
                            Mã: {stock.product.sku}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* SKU */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {stock.product?.sku || "N/A"}
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                        {stock.product?.category || "N/A"}
                      </span>
                    </td>
                    
                    {/* Location */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stock.location ? (
                        <div className="text-sm text-gray-900">
                          <div className="font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {stock.location.code}
                          </div>
                          {(stock.location.zone || stock.location.rack) && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {[stock.location.zone, stock.location.rack, stock.location.shelf, stock.location.bin]
                                .filter(Boolean)
                                .join(" - ")}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => onAssignLocation?.(stock)}
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          Gán vị trí
                        </button>
                      )}
                    </td>
                    
                    {/* Unit */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {stock.product?.unit || "N/A"}
                        </div>
                        {stock.product?.capacity && stock.product?.capacityUnit && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {stock.product.capacity}{stock.product.capacityUnit}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        (stock.product?.price || 0) === 0 ? "text-gray-400" : "text-gray-900"
                      )}>
                        {formatPrice(stock.product?.price || 0)}
                      </span>
                    </td>
                    
                    {/* Stock Quantity */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLow && !isCritical && (
                          <TrendingDown className="w-4 h-4 text-yellow-600" />
                        )}
                        {!isLow && !isCritical && (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                        {isCritical && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={cn(
                          "text-sm font-semibold",
                          isCritical ? "text-red-600" : isLow ? "text-yellow-600" : "text-gray-900"
                        )}>
                          {stock.quantity.toLocaleString("vi-VN")}
                        </span>
                        {stock.product?.unit && (
                          <span className="text-sm text-gray-500">
                            {stock.product.unit}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded text-xs font-medium",
                        status.color
                      )}>
                        {status.text}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    {onEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => onEdit(stock)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Sửa
                        </button>
                      </td>
                    )}
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
