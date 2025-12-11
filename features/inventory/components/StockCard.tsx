"use client";

import React from "react";
import { Package, TrendingDown, TrendingUp, MapPin } from "lucide-react";
import { ProductStock } from "../types";
import { cn } from "@/lib/utils";
import { formatUnit } from "@/core/inventory/productUnits";

interface StockCardProps {
  stock: ProductStock;
}

export default function StockCard({ stock }: StockCardProps) {
  const quantity = stock.quantity;
  const minLevel = stock.minLevel || 0;
  const maxLevel = stock.maxLevel || null;

  const isLow = minLevel > 0 && quantity <= minLevel;
  const isCritical = quantity <= 0;

  const getStockStatus = () => {
    if (isCritical) return "Hết hàng";
    if (isLow) return "Sắp hết";
    if (maxLevel && quantity >= maxLevel) return "Đầy";
    return "Bình thường";
  };

  const getStatusColor = () => {
    if (isCritical) return "border-red-500 bg-red-50";
    if (isLow) return "border-yellow-500 bg-yellow-50";
    if (maxLevel && quantity >= maxLevel) return "border-green-500 bg-green-50";
    return "border-gray-200 bg-white";
  };

  return (
    <div
      className={cn(
        "rounded-xl p-4 border-2 transition-all",
        getStatusColor()
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {stock.product?.name || "Unknown Product"}
            </h3>
            <p className="text-xs text-gray-500">
              {stock.product?.sku || "N/A"}
            </p>
          </div>
        </div>
        {isLow && (
          <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
        )}
        {!isLow && !isCritical && (
          <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tồn kho:</span>
          <div className="text-right">
            <span className="text-xl font-bold text-gray-900">
              {quantity.toLocaleString("vi-VN")} {stock.product?.unit || "pcs"}
            </span>
            {stock.product?.capacity && stock.product?.capacityUnit && (
              <div className="text-xs text-gray-500">
                ({stock.product.capacity}{stock.product.capacityUnit}/đơn vị)
              </div>
            )}
          </div>
        </div>

        {minLevel > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Mức tối thiểu:</span>
            <span className="font-medium">{minLevel} {stock.product?.unit || "pcs"}</span>
          </div>
        )}

        {maxLevel && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Mức tối đa:</span>
            <span className="font-medium">{maxLevel} {stock.product?.unit || "pcs"}</span>
          </div>
        )}

        {stock.location && (
          <div className="flex items-center gap-1 text-xs text-gray-600 pt-1">
            <MapPin className="w-3 h-3" />
            <span className="font-medium">{stock.location.code}</span>
            {(stock.location.zone || stock.location.rack) && (
              <span className="text-gray-500">
                ({[stock.location.zone, stock.location.rack, stock.location.shelf, stock.location.bin]
                  .filter(Boolean)
                  .join(" - ")})
              </span>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              isCritical
                ? "bg-red-100 text-red-700"
                : isLow
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            )}
          >
            {getStockStatus()}
          </span>
        </div>
      </div>
    </div>
  );
}

