"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useBranch } from "@/features/branches/hooks/useBranch";
import { getStockLevels, getLowStockAlerts, getStockTransactions } from "../services/inventoryApi";
import { ProductStock, LowStockAlert, StockTransaction } from "../types";
import StockCard from "./StockCard";
import StockListView from "./StockListView";
import LowStockAlertCard from "./LowStockAlertCard";
import StockTransactionList from "./StockTransactionList";
import { Package, AlertTriangle, Loader2, Database, Grid3x3, List, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ViewMode = "grid" | "list";

export default function InventoryDashboard() {
  const { currentBranch, loading: branchLoading, loadBranches } = useBranch();
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    // Wait for branch to load, then load inventory data
    if (!branchLoading && currentBranch?.id) {
      loadData();
    } else if (!branchLoading && !currentBranch) {
      // If no branch after loading, set loading to false
      setLoading(false);
    }
  }, [currentBranch, branchLoading]);

  const loadData = async () => {
    // Skip loading if branch is mock/default-branch
    if (!currentBranch?.id || currentBranch.id === "default-branch") {
      setLoading(false);
      setStocks([]);
      setAlerts([]);
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      const [stocksData, alertsData, transactionsData] = await Promise.all([
        getStockLevels(currentBranch.id).catch(() => []),
        getLowStockAlerts(currentBranch.id).catch(() => []),
        getStockTransactions(currentBranch.id, 20).catch(() => []),
      ]);
      setStocks(stocksData || []);
      setAlerts(alertsData || []);
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error("Error loading inventory data:", error);
      // Set empty arrays on error
      setStocks([]);
      setAlerts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("Bạn có chắc muốn tạo dữ liệu mẫu? Điều này sẽ tạo sản phẩm và tồn kho mẫu.")) {
      return;
    }

    try {
      setSeeding(true);
      const response = await fetch("/api/inventory/seed", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.data.message}`);
        // Reload branches to get the real branch, then reload data
        await loadBranches();
        // Wait a bit for branch to update, then reload data
        setTimeout(() => {
          loadData();
        }, 500);
      } else {
        alert(`❌ Lỗi: ${result.error || "Không thể tạo dữ liệu mẫu"}`);
      }
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("❌ Có lỗi xảy ra khi tạo dữ liệu mẫu");
    } finally {
      setSeeding(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    stocks.forEach((stock) => {
      if (stock.product?.category) {
        cats.add(stock.product.category);
      }
    });
    return Array.from(cats).sort();
  }, [stocks]);

  // Filter and search stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        stock.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        filterCategory === "all" || stock.product?.category === filterCategory;

      // Status filter
      let matchesStatus = true;
      if (filterStatus !== "all") {
        const quantity = stock.quantity;
        const minLevel = stock.minLevel || 0;
        if (filterStatus === "critical") {
          matchesStatus = quantity <= 0;
        } else if (filterStatus === "low") {
          matchesStatus = minLevel > 0 && quantity <= minLevel && quantity > 0;
        } else if (filterStatus === "normal") {
          matchesStatus = quantity > minLevel;
        }
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [stocks, searchTerm, filterCategory, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Quản lý kho
            </h1>
            {currentBranch && (
              <p className="text-sm text-gray-600 mt-1">
                Chi nhánh: {currentBranch.name}
                {currentBranch.id === "default-branch" && (
                  <span className="ml-2 text-xs text-gray-400">(Chưa có chi nhánh thật)</span>
                )}
              </p>
            )}
            {!currentBranch && !branchLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Vui lòng chọn chi nhánh để xem kho hàng
              </p>
            )}
          </div>
          <Button
            onClick={handleSeedData}
            disabled={seeding}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            {seeding ? "Đang tạo..." : "Tạo dữ liệu mẫu"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Cảnh báo tồn kho thấp
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <LowStockAlertCard key={alert.productId} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Stock Levels */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tồn kho hiện tại
              {filteredStocks.length !== stocks.length && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredStocks.length}/{stocks.length})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Xem dạng lưới"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition ${
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Xem dạng danh sách"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          {stocks.length > 0 && (
            <div className="mb-4 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Lọc:</span>
                </div>
                
                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="critical">Hết hàng</option>
                  <option value="low">Sắp hết</option>
                  <option value="normal">Bình thường</option>
                </select>

                {/* Clear Filters */}
                {(searchTerm || filterCategory !== "all" || filterStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCategory("all");
                      setFilterStatus("all");
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
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
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có sản phẩm nào trong kho</p>
              <p className="text-sm text-gray-400 mt-2">Hãy thêm sản phẩm để bắt đầu quản lý kho</p>
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp</p>
              <p className="text-sm text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStocks.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))}
            </div>
          ) : (
            <StockListView stocks={filteredStocks} />
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Giao dịch gần đây
          </h2>
          <StockTransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

