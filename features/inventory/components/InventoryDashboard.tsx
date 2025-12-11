"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useBranch } from "@/features/branches/hooks/useBranch";
import { getStockLevels, getLowStockAlerts, getStockTransactions } from "../services/inventoryApi";
import { ProductStock, LowStockAlert, StockTransaction } from "../types";
import StockCard from "./StockCard";
import StockListView from "./StockListView";
import CategorySidebar from "./CategorySidebar";
import EditProductModal from "./EditProductModal";
import CreateProductModal from "./CreateProductModal";
import ImportExcelModal from "./ImportExcelModal";
import AssignLocationModal from "./AssignLocationModal";
import SupplierListPage from "./SupplierListPage";
import LowStockAlertCard from "./LowStockAlertCard";
import StockTransactionList from "./StockTransactionList";
import InventoryOverview from "./InventoryOverview";
import ProductListPage from "./ProductListPage";
import { Package, AlertTriangle, Loader2, Database, Grid3x3, List, Search, Filter, Download, Upload, Copy, ChevronLeft, ChevronRight, Plus, MapPin, Building2, LayoutDashboard, List as ListIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ViewMode = "grid" | "list";
type TabMode = "overview" | "products" | "suppliers" | "inventory";

export default function InventoryDashboard() {
  const { currentBranch, loading: branchLoading, loadBranches } = useBranch();
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingStock, setEditingStock] = useState<ProductStock | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [assigningLocationStock, setAssigningLocationStock] = useState<ProductStock | null>(null);
  const [isAssignLocationModalOpen, setIsAssignLocationModalOpen] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabMode>("overview");

  // Auto-set viewMode to "list" when on inventory tab
  useEffect(() => {
    if (activeTab === "inventory") {
      setViewMode("list");
    }
  }, [activeTab]);

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

  // Load locations when branch changes
  useEffect(() => {
    if (currentBranch?.id) {
      loadLocations();
    }
  }, [currentBranch?.id]);

  const loadLocations = async () => {
    if (!currentBranch?.id) return;

    try {
      const response = await fetch(`/api/inventory/locations?branchId=${currentBranch.id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLocations(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading locations:", error);
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
        stock.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.location?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.location?.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.location?.rack?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        filterCategory === "all" || stock.product?.category === filterCategory;

      // Location filter
      const matchesLocation =
        filterLocation === "all" ||
        (filterLocation === "none" && !stock.locationId) ||
        stock.locationId === filterLocation;

      // Status filter
      let matchesStatus = true;
      if (filterStatus !== "all") {
        const quantity = stock.quantity;
        const minLevel = stock.minLevel || 0;
        if (filterStatus === "in_stock") {
          matchesStatus = quantity > 0;
        } else if (filterStatus === "out_of_stock") {
          matchesStatus = quantity === 0;
        } else if (filterStatus === "low_stock") {
          matchesStatus = minLevel > 0 && quantity <= minLevel && quantity > 0;
        } else if (filterStatus === "negative") {
          matchesStatus = quantity < 0;
        } else if (filterStatus === "critical") {
          matchesStatus = quantity <= 0;
        } else if (filterStatus === "low") {
          matchesStatus = minLevel > 0 && quantity <= minLevel && quantity > 0;
        } else if (filterStatus === "normal") {
          matchesStatus = quantity > minLevel;
        }
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    });
  }, [stocks, searchTerm, filterCategory, filterLocation, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterLocation, filterStatus]);

  // Export to Excel handler
  const handleExportExcel = async () => {
    try {
      if (stocks.length === 0) {
        alert("Không có dữ liệu để xuất");
        return;
      }

      // Import XLSX dynamically
      const XLSX = (await import("xlsx")).default;

      // Prepare data according to Excel template format (Hình 3)
      const exportData = stocks.map((stock) => {
        const product = stock.product;
        // Extract SKU from notes if available
        const skuMatch = product?.notes?.match(/SKU:\s*([^\n]+)/);
        const sku = skuMatch ? skuMatch[1].trim() : "";
        // Extract brand from notes if available
        const brandMatch = product?.notes?.match(/Thương hiệu:\s*([^\n]+)/);
        const brand = brandMatch ? brandMatch[1].trim() : "";
        // Get capacity string
        const capacityStr = product?.capacity && product?.capacityUnit
          ? `${product.capacity} ${product.capacityUnit}`
          : "";

        return {
          "Tên sản phẩm": product?.name || "",
          "Mã sản phẩm": sku || "",
          "Thương hiệu": brand || "",
          "Nhóm sản phẩm": product?.category || "",
          "Mô tả": product?.notes?.replace(/SKU:.*\n?/g, "").replace(/Thương hiệu:.*\n?/g, "").trim() || "",
          "Đơn vị tính": product?.unit || "",
          "Dung tích (nếu có)": capacityStr,
          "Giá nhập": product?.pricePerUnit ? Math.round(product.pricePerUnit) : 0,
          "Giá bán": product?.pricePerUnit ? Math.round(product.pricePerUnit) : 0,
        };
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DANH SÁCH SẢN PHẨM");

      // Generate filename with current date
      const filename = `danh_sach_san_pham_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, filename);

      alert(`✅ Đã xuất ${stocks.length} sản phẩm ra file Excel`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Có lỗi xảy ra khi xuất Excel");
    }
  };

  // Import from Excel handler
  const handleImportExcel = () => {
    setIsImportModalOpen(true);
  };

  // Copy from branch handler
  const handleCopyFromBranch = () => {
    // TODO: Implement copy from branch
    alert("Tính năng chép từ chi nhánh đang phát triển");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full flex gap-6">
      {/* Sidebar - Ẩn khi ở tab "overview" */}
      {activeTab !== "overview" && (
        <CategorySidebar
          stocks={stocks}
          selectedCategory={filterCategory}
          onCategorySelect={setFilterCategory}
        />
      )}

      {/* Main Content */}
      <div className={activeTab === "overview" ? "w-full" : "flex-1"}>
        {/* Header */}
        <div className="mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 inline-block mr-2" />
              Tổng thể kho
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "products"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <ListIcon className="w-4 h-4 inline-block mr-2" />
              Danh sách sản phẩm
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "inventory"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Package className="w-4 h-4 inline-block mr-2" />
              Quản lý kho hàng bán
            </button>
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "suppliers"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Building2 className="w-4 h-4 inline-block mr-2" />
              Quản lý nhà cung cấp
            </button>
          </div>

          {activeTab === "inventory" && (
            <>
              <div className="flex items-center justify-between mb-4">
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
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCopyFromBranch}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Chép từ chi nhánh
                  </Button>
                  <Button
                    onClick={handleImportExcel}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Nhập từ Excel
                  </Button>
                  <Button
                    onClick={handleExportExcel}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Xuất ra Excel
                  </Button>
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
            </>
          )}
        </div>

        {/* Content */}
        {activeTab === "overview" ? (
          <InventoryOverview stocks={stocks} alerts={alerts} loading={loading} />
        ) : activeTab === "products" ? (
          <ProductListPage
            stocks={stocks}
            onEdit={(stock) => {
              setEditingStock(stock);
              setIsEditModalOpen(true);
            }}
            onAssignLocation={(stock) => {
              setAssigningLocationStock(stock);
              setIsAssignLocationModalOpen(true);
            }}
            onCreateProduct={() => setIsCreateModalOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterLocation={filterLocation}
            onFilterLocationChange={setFilterLocation}
            locations={locations}
          />
        ) : activeTab === "suppliers" ? (
          <SupplierListPage />
        ) : (
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
          {/* Total Value Summary */}
          {stocks.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">TỔNG GIÁ TRỊ KHO (THEO GIÁ NHẬP TB)</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {stocks.reduce((sum, stock) => {
                      const costPrice = stock.product?.costPrice || 0;
                      return sum + (stock.quantity * costPrice);
                    }, 0).toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Bạn có chắc muốn cân bằng tất cả kho về 0? Hành động này không thể hoàn tác!")) {
                      alert("Tính năng đang được phát triển");
                    }
                  }}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cân bằng về 0
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tồn kho hiện tại
              {filteredStocks.length !== stocks.length && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredStocks.length}/{stocks.length})
                </span>
              )}
            </h2>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
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

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-gray-200">
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    filterStatus === "all"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tất cả ({stocks.length})
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("in_stock");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    filterStatus === "in_stock"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Còn hàng ({stocks.filter(s => s.quantity > 0).length})
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("low_stock");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    filterStatus === "low_stock"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sắp hết ({stocks.filter(s => s.minLevel && s.quantity <= s.minLevel && s.quantity > 0).length})
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("out_of_stock");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    filterStatus === "out_of_stock"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Hết hàng ({stocks.filter(s => s.quantity === 0).length})
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("negative");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    filterStatus === "negative"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Bị âm ({stocks.filter(s => s.quantity < 0).length})
                </button>
              </div>

              {/* Additional Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Lọc:</span>
                </div>

                {/* Location Filter */}
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả vị trí</option>
                  <option value="none">Chưa gán vị trí</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.code}
                      {location.zone || location.rack
                        ? ` (${[location.zone, location.rack, location.shelf, location.bin]
                            .filter(Boolean)
                            .join(" - ")})`
                        : ""}
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                {(searchTerm || filterCategory !== "all" || filterStatus !== "all" || filterLocation !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCategory("all");
                      setFilterStatus("all");
                      setFilterLocation("all");
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
              {paginatedStocks.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))}
            </div>
          ) : (
            <>
              <StockListView 
                stocks={paginatedStocks} 
                onEdit={(stock) => {
                  setEditingStock(stock);
                  setIsEditModalOpen(true);
                }}
                onAssignLocation={(stock) => {
                  setAssigningLocationStock(stock);
                  setIsAssignLocationModalOpen(true);
                }}
                onRefresh={loadData}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      Hiện {startIndex + 1} đến {Math.min(endIndex, filteredStocks.length)} của {filteredStocks.length} kết quả
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-4 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>Hiển thị 10</option>
                      <option value={20}>Hiển thị 20</option>
                      <option value={50}>Hiển thị 50</option>
                      <option value={100}>Hiển thị 100</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trang đầu
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 text-sm rounded-lg ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trang cuối
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

          {/* Recent Transactions */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Giao dịch gần đây
            </h2>
            <StockTransactionList transactions={transactions} />
          </div>
        </div>
        )}
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStock(null);
        }}
        stock={editingStock}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
        branchId={currentBranch?.id}
      />

      {/* Assign Location Modal */}
      <AssignLocationModal
        isOpen={isAssignLocationModalOpen}
        onClose={() => {
          setIsAssignLocationModalOpen(false);
          setAssigningLocationStock(null);
        }}
        stock={assigningLocationStock}
        onSuccess={() => {
          loadData();
          loadLocations();
        }}
      />
    </div>
  );
}

