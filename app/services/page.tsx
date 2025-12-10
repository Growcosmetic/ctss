"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import * as XLSX from "xlsx";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Grid3x3,
  List,
  Scissors,
  DollarSign,
  Clock,
  FileSpreadsheet,
  FolderTree,
  ChevronRight,
  Download,
  ArrowUpDown,
  CheckSquare,
  Square,
  MoreVertical,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import ServiceFormModal from "@/components/services/ServiceFormModal";
import ImportExcelModal from "@/components/services/ImportExcelModal";
import ServiceCategoryManagementModal from "@/components/services/ServiceCategoryManagementModal";

interface Service {
  id: string;
  name: string;
  code?: string;
  description?: string;
  englishName?: string;
  englishDescription?: string;
  duration: number;
  image?: string;
  isActive: boolean;
  allowPriceOverride?: boolean;
  unit?: string;
  displayLocation?: string;
  category: string | {
    id: string;
    name: string;
  };
  price?: number;
  servicePrices?: Array<{
    id: string;
    price: number;
    cost?: number;
    isActive: boolean;
  }>;
}

interface ServiceCategory {
  id: string;
  name: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("table");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"name" | "price" | "duration" | "category">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [allServices, setAllServices] = useState<Service[]>([]);

  // Use refs to store values and prevent infinite loops
  const categoriesRef = useRef<ServiceCategory[]>([]);
  const selectedCategoryRef = useRef<string>("all");
  const searchTermRef = useRef<string>("");
  const isFetchingRef = useRef<boolean>(false);
  const categoriesLoadedRef = useRef<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update refs when values change (these don't trigger re-renders)
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  // Fetch categories only once on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/services/categories");
        const result = await response.json();
        if (result.success && result.data?.length > 0) {
          setCategories(result.data);
          categoriesLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, []); // Empty array - only runs once on mount

  // Fetch services function - exposed for manual calls (delete, edit, etc.)
  const fetchServices = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      const params = new URLSearchParams();
      const currentCategory = selectedCategoryRef.current;
      const currentSearchTerm = searchTermRef.current;
      
      // Use category name, not categoryId
      if (currentCategory !== "all") {
        const category = categoriesRef.current.find(c => c.id === currentCategory);
        const categoryName = category?.name || currentCategory;
        params.append("category", categoryName);
      }
      if (currentSearchTerm) {
        params.append("search", currentSearchTerm);
      }

      const response = await fetch(`/api/services?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setServices(result.services || result.data?.services || []);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // Empty array - function never changes

  // Mark categories as loaded when they arrive
  useEffect(() => {
    if (categories.length > 0) {
      categoriesLoadedRef.current = true;
    }
  }, [categories.length]);

  // Track previous values to detect actual changes
  const prevSelectedCategoryRef = useRef<string>(selectedCategory);
  const prevSearchTermRef = useRef<string>(searchTerm);
  const hasInitialFetchRef = useRef<boolean>(false);

  // Single effect to handle service fetching when filters change - ONLY depends on filter values
  useEffect(() => {
    const categoryChanged = prevSelectedCategoryRef.current !== selectedCategory;
    const searchChanged = prevSearchTermRef.current !== searchTerm;
    const isInitialMount = !hasInitialFetchRef.current;

    // Update refs
    prevSelectedCategoryRef.current = selectedCategory;
    prevSearchTermRef.current = searchTerm;

    // Don't fetch if categories haven't loaded yet (unless "all" is selected)
    if (selectedCategory !== "all" && !categoriesLoadedRef.current) {
      return;
    }

    // Clear any pending search timeout when category changes
    if (categoryChanged && searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // If category changed, fetch immediately
    if (categoryChanged) {
      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        return;
      }
      hasInitialFetchRef.current = true;
      fetchServices();
      return;
    }

    // If only search term changed, debounce it (wait 300ms after user stops typing)
    if (searchChanged) {
      // Clear any pending timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        // Prevent concurrent fetches
        if (isFetchingRef.current) {
          return;
        }
        fetchServices();
      }, 300);
      return;
    }

    // On initial mount, fetch services immediately (if categories are loaded or "all" is selected)
    if (isInitialMount) {
      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        return;
      }
      hasInitialFetchRef.current = true;
      fetchServices();
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerm]); // ONLY filter values, NOT fetchServices or categories

  useEffect(() => {
    // Fetch all services for category counts
    fetch("/api/services")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setAllServices(result.services || []);
        }
      })
      .catch(console.error);
  }, []);

  const getCurrentPrice = useCallback((service: Service) => {
    if (service.servicePrices && service.servicePrices.length > 0) {
      const activePrice = service.servicePrices.find((p) => p.isActive);
      return activePrice?.price || 0;
    }
    return service.price || 0;
  }, []);

  // Calculate category counts from allServices
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (Array.isArray(allServices)) {
      allServices.forEach((service) => {
        if (service) {
          const categoryName = typeof service.category === 'string' 
            ? service.category 
            : service.category?.name || 'Khác';
          counts[categoryName] = (counts[categoryName] || 0) + 1;
        }
      });
    }
    return counts;
  }, [allServices]);

  // Sort services based on sortField and sortDirection
  const sortedServices = useMemo(() => {
    if (!Array.isArray(services) || services.length === 0) {
      return [];
    }
    const sorted = [...services];
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case "price":
          aValue = getCurrentPrice(a);
          bValue = getCurrentPrice(b);
          break;
        case "duration":
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case "category":
          aValue = typeof a.category === 'string' ? a.category : (a.category?.name || '');
          bValue = typeof b.category === 'string' ? b.category : (b.category?.name || '');
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [services, sortField, sortDirection, getCurrentPrice]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchServices();
    fetchCategories();
    setIsFormOpen(false);
    setSelectedService(null);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(new Set(services.map(s => s.id)));
    } else {
      setSelectedServices(new Set());
    }
  };

  // Handle select one
  const handleSelectService = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedServices);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedServices(newSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedServices.size === 0) {
      alert("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }
    
    if (!confirm(`Bạn có chắc muốn xóa ${selectedServices.size} dịch vụ đã chọn?`)) {
      return;
    }

    try {
      const promises = Array.from(selectedServices).map(id => 
        fetch(`/api/services/${id}`, { method: "DELETE" })
      );
      await Promise.all(promises);
      setSelectedServices(new Set());
      await fetchServices();
    } catch (error) {
      console.error("Failed to delete services:", error);
      alert("Có lỗi xảy ra khi xóa dịch vụ");
    }
  };

  // Handle bulk change category
  const handleBulkChangeCategory = async (newCategory: string) => {
    if (selectedServices.size === 0) {
      alert("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }

    try {
      const promises = Array.from(selectedServices).map(id =>
        fetch(`/api/services/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: newCategory }),
        })
      );
      await Promise.all(promises);
      setSelectedServices(new Set());
      await fetchServices();
      alert(`Đã cập nhật ${selectedServices.size} dịch vụ`);
    } catch (error) {
      console.error("Failed to update services:", error);
      alert("Có lỗi xảy ra khi cập nhật dịch vụ");
    }
  };

  // Handle sort
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      // Fetch all services for export (not just filtered)
      const response = await fetch("/api/services");
      const result = await response.json();
      const servicesToExport = result.success ? (result.services || []) : services;

      if (servicesToExport.length === 0) {
        alert("Không có dữ liệu để xuất");
        return;
      }

      // Prepare data for export
      const exportData = servicesToExport.map((service: Service, index: number) => ({
        "STT": index + 1,
        "Tên dịch vụ": service.name,
        "Mã dịch vụ": service.code || "",
        "Nhóm dịch vụ": typeof service.category === 'string' ? service.category : service.category?.name || "",
        "Mô tả": service.description || "",
        "Giá dịch vụ": service.price || 0,
        "Thời gian phục vụ (phút)": service.duration || 30,
        "Tên tiếng Anh": service.englishName || "",
        "Mô tả bằng Tiếng Anh": service.englishDescription || "",
        "Trạng thái": service.isActive ? "Hoạt động" : "Đã ngừng",
      }));

      // Use XLSX library to create Excel file
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dịch vụ");
      
      // Generate filename with current date
      const filename = `danh_sach_dich_vu_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Có lỗi xảy ra khi xuất Excel");
    }
  };

  return (
    <MainLayout>
      <div className="flex gap-6">
        {/* Sidebar - Nhóm dịch vụ */}
        <div className="w-64 flex-shrink-0">
          <Card>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Phân nhóm dịch vụ</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <FolderTree size={16} className="mr-1" />
                  Quản lý
                </Button>
              </div>
            </div>
            <div className="p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center justify-between ${
                  selectedCategory === "all"
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>Tất cả</span>
                <span className="text-xs text-gray-500">({services.length})</span>
              </button>
              {categories.map((cat) => {
                const count = categoryCounts[cat.name] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? "bg-primary-50 text-primary-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ChevronRight size={14} className={selectedCategory === cat.id ? "text-primary-600" : "text-gray-400"} />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="text-xs text-gray-500">({count})</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý dịch vụ</h1>
            <p className="text-gray-500 mt-1">Quản lý dịch vụ salon</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <Download size={18} className="mr-2" />
              Xuất ra Excel
            </Button>
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              <FileSpreadsheet size={18} className="mr-2" />
              Nhập từ Excel
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus size={18} className="mr-2" />
              Tạo dịch vụ mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    fetchServices();
                  }
                }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-primary-100 text-primary-600" : ""}`}
                title="Grid view"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-primary-100 text-primary-600" : ""}`}
                title="List view"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded ${viewMode === "table" ? "bg-primary-100 text-primary-600" : ""}`}
                title="Table view"
              >
                <FileSpreadsheet size={18} />
              </button>
            </div>
          </div>
        </Card>

        {/* Services Grid/List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                {service.image && (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden mb-4">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {!service.isActive && (
                      <span className="text-xs text-red-600">Đã ngừng</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock size={14} />
                      <span>{service.duration} phút</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary-600 font-semibold">
                      <DollarSign size={14} />
                      <span>{formatCurrency(getCurrentPrice(service))}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {typeof service.category === 'string' ? service.category : service.category?.name || 'Khác'}
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(service);
                      }}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(service.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : viewMode === "table" ? (
          <Card>
            {/* Bulk Actions */}
            {selectedServices.size > 0 && (
              <div className="p-4 bg-primary-50 border-b border-primary-200 flex items-center justify-between">
                <span className="text-sm font-medium text-primary-700">
                  Đã chọn {selectedServices.size} dịch vụ
                </span>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkChangeCategory(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="text-sm px-3 py-1 border border-gray-300 rounded"
                  >
                    <option value="">Đổi nhóm...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Xóa ({selectedServices.size})
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedServices.size === services.length && services.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </TableHead>
                    <TableHead className="w-16">Ảnh</TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 hover:text-primary-600"
                      >
                        Tên dịch vụ
                        <ArrowUpDown size={14} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort("category")}
                        className="flex items-center gap-1 hover:text-primary-600"
                      >
                        Nhóm dịch vụ
                        <ArrowUpDown size={14} />
                      </button>
                    </TableHead>
                    <TableHead>Mã</TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort("price")}
                        className="flex items-center gap-1 hover:text-primary-600"
                      >
                        Giá bán
                        <ArrowUpDown size={14} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort("duration")}
                        className="flex items-center gap-1 hover:text-primary-600"
                      >
                        Thời gian
                        <ArrowUpDown size={14} />
                      </button>
                    </TableHead>
                    <TableHead>Tình trạng</TableHead>
                    <TableHead className="w-24">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        Không có dịch vụ nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedServices.map((service) => {
                      const categoryName = typeof service.category === 'string' 
                        ? service.category 
                        : service.category?.name || 'Khác';
                      const isSelected = selectedServices.has(service.id);
                      
                      return (
                        <TableRow
                          key={service.id}
                          className={`cursor-pointer hover:bg-gray-50 ${isSelected ? "bg-primary-50" : ""}`}
                          onClick={() => setSelectedService(service)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectService(service.id, e.target.checked)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                          </TableCell>
                          <TableCell>
                            {service.image ? (
                              <img
                                src={service.image}
                                alt={service.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <Scissors size={20} className="text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{service.name}</p>
                              {service.code && (
                                <p className="text-xs text-gray-500">Mã: {service.code}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700">{categoryName}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{service.code || "-"}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-primary-600">
                                {formatCurrency(getCurrentPrice(service))}
                              </p>
                              {service.allowPriceOverride && (
                                <p className="text-xs text-gray-500">(Sửa giá khi thanh toán)</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock size={14} />
                              <span>{service.duration} phút</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {service.isActive ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Sẵn sàng
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Đã ngừng
                              </span>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(service)}
                                className="text-primary-600 hover:text-primary-700"
                                title="Sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(service.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="divide-y">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {typeof service.category === 'string' ? service.category : service.category?.name || 'Khác'}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>{service.duration} phút</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">
                          {formatCurrency(getCurrentPrice(service))}
                        </p>
                        {!service.isActive && (
                          <p className="text-xs text-red-600">Đã ngừng</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(service);
                          }}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(service.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Service Detail Modal */}
        {selectedService && (
          <Modal
            isOpen={!!selectedService}
            onClose={() => setSelectedService(null)}
            title={selectedService.name}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nhóm dịch vụ</p>
                <p className="text-gray-900">
                  {typeof selectedService.category === 'string' 
                    ? selectedService.category 
                    : selectedService.category?.name || 'N/A'}
                </p>
              </div>
              {selectedService.code && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Mã dịch vụ</p>
                  <p className="text-gray-900">{selectedService.code}</p>
                </div>
              )}
              {selectedService.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Mô tả</p>
                  <p className="text-gray-900">{selectedService.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Thời lượng</p>
                  <p className="text-gray-900">{selectedService.duration} phút</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Giá hiện tại</p>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(getCurrentPrice(selectedService))}
                  </p>
                </div>
              </div>
              {selectedService.servicePrices && selectedService.servicePrices.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Lịch sử giá</p>
                  <div className="space-y-2">
                    {selectedService.servicePrices.map((price) => (
                    <div
                      key={price.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="font-medium">
                          {formatCurrency(price.price)}
                        </span>
                        {price.cost && (
                          <span className="text-sm text-gray-500 ml-2">
                            (Giá vốn: {formatCurrency(price.cost)})
                          </span>
                        )}
                      </div>
                      {price.isActive && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Đang áp dụng
                        </span>
                      )}
                    </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Service Form Modal */}
        <ServiceFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          categories={categories}
          onSuccess={handleFormSuccess}
        />

        {/* Import Excel Modal */}
        <ImportExcelModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            fetchServices();
            fetchCategories();
          }}
        />

        {/* Service Category Management Modal */}
        <ServiceCategoryManagementModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          services={services}
          onUpdate={() => {
            fetchServices();
            fetchCategories();
          }}
        />
        </div>
      </div>
    </MainLayout>
  );
}
