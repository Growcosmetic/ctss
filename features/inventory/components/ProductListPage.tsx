"use client";

import React, { useState, useMemo } from "react";
import { ProductStock } from "../types";
import StockCard from "./StockCard";
import StockListView from "./StockListView";
import EditProductModal from "./EditProductModal";
import AssignLocationModal from "./AssignLocationModal";
import { Grid3x3, List, Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProductListPageProps {
  stocks: ProductStock[];
  onEdit: (stock: ProductStock) => void;
  onAssignLocation: (stock: ProductStock) => void;
  onCreateProduct?: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterLocation: string;
  onFilterLocationChange: (location: string) => void;
  locations: any[];
}

export default function ProductListPage({
  stocks,
  onEdit,
  onAssignLocation,
  onCreateProduct,
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  filterLocation,
  onFilterLocationChange,
  locations,
}: ProductListPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter logic
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesSearch =
        !searchTerm ||
        stock.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.location?.code?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || stock.product?.category === filterCategory;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "in_stock" && stock.quantity > 0) ||
        (filterStatus === "out_of_stock" && stock.quantity === 0) ||
        (filterStatus === "low_stock" &&
          stock.minLevel !== null &&
          stock.quantity <= stock.minLevel);

      const matchesLocation =
        filterLocation === "all" ||
        (filterLocation === "no_location" && !stock.locationId) ||
        stock.locationId === filterLocation;

      return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    });
  }, [stocks, searchTerm, filterCategory, filterStatus, filterLocation]);

  // Pagination
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Danh sách sản phẩm</h2>
            <p className="text-gray-600 mt-1">
              Tổng cộng: {filteredStocks.length} sản phẩm
            </p>
          </div>
          {onCreateProduct && (
            <Button
              onClick={onCreateProduct}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Thêm sản phẩm
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {stocks.length > 0 && (
        <div className="mb-4 space-y-3">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, SKU, hoặc vị trí..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => {
                  onFilterCategoryChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả nhóm</option>
                {Array.from(new Set(stocks.map((s) => s.product?.category).filter(Boolean))).map(
                  (cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  )
                )}
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                onFilterStatusChange(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="in_stock">Còn hàng</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="low_stock">Tồn kho thấp</option>
            </select>

            <select
              value={filterLocation}
              onChange={(e) => {
                onFilterLocationChange(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả vị trí</option>
              <option value="no_location">Chưa có vị trí</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.code}
                </option>
              ))}
            </select>

            {(filterCategory !== "all" ||
              filterStatus !== "all" ||
              filterLocation !== "all" ||
              searchTerm) && (
              <button
                onClick={() => {
                  onSearchChange("");
                  onFilterCategoryChange("all");
                  onFilterStatusChange("all");
                  onFilterLocationChange("all");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stock Display */}
      {stocks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Chưa có sản phẩm nào trong kho</p>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp</p>
          <p className="text-sm text-gray-400 mt-2">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedStocks.map((stock) => (
            <StockCard key={stock.id} stock={stock} />
          ))}
        </div>
      ) : (
        <>
          <StockListView
            stocks={paginatedStocks}
            onEdit={onEdit}
            onAssignLocation={onAssignLocation}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Hiện {startIndex + 1} đến {Math.min(endIndex, filteredStocks.length)} của{" "}
                  {filteredStocks.length} kết quả
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                  <option value={100}>100 / trang</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <span className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
