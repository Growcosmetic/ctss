"use client";

import React, { useState } from "react";
import { Package, Plus, Edit, Search } from "lucide-react";
import { ProductStock } from "../types";
import StockCard from "./StockCard";

interface ProductListProps {
  stocks: ProductStock[];
  onAddStock?: (stock: ProductStock) => void;
  onEditStock?: (stock: ProductStock) => void;
}

export default function ProductList({
  stocks,
  onAddStock,
  onEditStock,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStocks = stocks.filter((stock) =>
    stock.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {onAddStock && (
          <button
            onClick={() => onAddStock?.(stocks[0])}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Thêm tồn kho
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredStocks.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm nào"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => (
            <div key={stock.id} className="relative group">
              <StockCard stock={stock} />
              {onEditStock && (
                <button
                  onClick={() => onEditStock(stock)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

