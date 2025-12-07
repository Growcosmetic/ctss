// ============================================
// Customer360 Product List
// ============================================

"use client";

import React from "react";
import { Package, Calendar, Tag, Receipt, ShoppingBag } from "lucide-react";
import type { CustomerProductHistory } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CustomerProductListProps {
  products: CustomerProductHistory[];
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Dầu gội": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "Dầu xả": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  "Mặt nạ": {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  "Serum": {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  "Tạo kiểu": {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  "Chăm sóc": {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
};

const getCategoryColor = (category: string) => {
  const normalizedCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(categoryColors)) {
    if (normalizedCategory.includes(key.toLowerCase())) {
      return value;
    }
  }
  return {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  };
};

export function CustomerProductList({ products }: CustomerProductListProps) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Sản phẩm đã sử dụng / mua
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Khách chưa mua sản phẩm nào</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "EEEE, dd MMMM yyyy", { locale: vi });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  const formatShortDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  // Group products by category for better organization
  const groupedProducts = products.reduce(
    (acc, product) => {
      const category = product.category || "Khác";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    },
    {} as Record<string, CustomerProductHistory[]>
  );

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Sản phẩm đã sử dụng / mua
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {products.length} {products.length === 1 ? "sản phẩm" : "sản phẩm"}
        </span>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => {
          const categoryColor = getCategoryColor(category);

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span
                  className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
                >
                  {category}
                </span>
                <span className="text-xs text-gray-500">
                  ({categoryProducts.length})
                </span>
              </div>

              {/* Products in Category */}
              <div className="space-y-3 pl-4">
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          <div className="font-semibold text-gray-900 truncate">
                            {product.name}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              {formatDate(product.purchasedAt)}
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5" />
                            <span className="text-xs font-mono">
                              {product.invoiceId.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-xs text-gray-500 mb-1">
                          Mua ngày
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          {formatShortDate(product.purchasedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

