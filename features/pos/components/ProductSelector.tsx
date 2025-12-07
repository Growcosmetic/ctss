"use client";

import React, { useState } from "react";
import { X, Search } from "lucide-react";

// Mock products data - replace with real data later
const mockProducts = [
  { id: "product-1", name: "Dầu gội", price: 150000, stock: 50 },
  { id: "product-2", name: "Dầu xả", price: 120000, stock: 45 },
  { id: "product-3", name: "Kem ủ tóc", price: 200000, stock: 30 },
  { id: "product-4", name: "Serum tóc", price: 250000, stock: 25 },
  { id: "product-5", name: "Mặt nạ tóc", price: 180000, stock: 40 },
];

interface ProductSelectorProps {
  onSelect: (product: { id: string; name: string; price: number }) => void;
  onClose: () => void;
}

export default function ProductSelector({ onSelect, onClose }: ProductSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Chọn sản phẩm</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không tìm thấy sản phẩm</p>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelect({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                    });
                    onClose();
                  }}
                  className="w-full p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        Tồn kho: {product.stock}
                      </p>
                    </div>
                    <p className="font-semibold text-blue-600">
                      {product.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

