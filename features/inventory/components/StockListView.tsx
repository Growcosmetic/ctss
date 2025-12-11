"use client";

import React from "react";
import { Package, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { ProductStock } from "../types";
import { cn } from "@/lib/utils";

interface StockListViewProps {
  stocks: ProductStock[];
}

export default function StockListView({ stocks }: StockListViewProps) {
  const getStockStatus = (stock: ProductStock) => {
    const quantity = stock.quantity;
    const minLevel = stock.minLevel || 0;
    const maxLevel = stock.maxLevel || null;

    if (quantity <= 0) return { text: "Hết hàng", color: "text-red-600 bg-red-50", severity: "critical" };
    if (minLevel > 0 && quantity <= minLevel) return { text: "Sắp hết", color: "text-yellow-600 bg-yellow-50", severity: "warning" };
    if (maxLevel && quantity >= maxLevel) return { text: "Đầy", color: "text-green-600 bg-green-50", severity: "normal" };
    return { text: "Bình thường", color: "text-gray-600 bg-gray-50", severity: "normal" };
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mức tối thiểu
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mức tối đa
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isCritical ? "bg-red-100" : isLow ? "bg-yellow-100" : "bg-blue-100"
                        )}>
                          <Package className={cn(
                            "w-5 h-5",
                            isCritical ? "text-red-600" : isLow ? "text-yellow-600" : "text-blue-600"
                          )} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {stock.product?.name || "Unknown Product"}
                          </div>
                          {stock.product?.unit && (
                            <div className="text-xs text-gray-500">
                              Đơn vị: {stock.product.unit}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {stock.product?.sku || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {stock.product?.category || "N/A"}
                      </span>
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-900">
                        {stock.minLevel ? stock.minLevel.toLocaleString("vi-VN") : "-"}
                      </span>
                      {stock.minLevel && stock.product?.unit && (
                        <span className="text-xs text-gray-500 ml-1">{stock.product.unit}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-900">
                        {stock.maxLevel ? stock.maxLevel.toLocaleString("vi-VN") : "-"}
                      </span>
                      {stock.maxLevel && stock.product?.unit && (
                        <span className="text-xs text-gray-500 ml-1">{stock.product.unit}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                        status.color
                      )}>
                        {status.text}
                      </span>
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
