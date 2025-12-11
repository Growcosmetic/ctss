"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Building2, Plus, Search, Edit, Trash2, Download, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import SupplierFormModal from "./SupplierFormModal";
import ImportSupplierExcelModal from "./ImportSupplierExcelModal";

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  taxCode?: string | null;
  website?: string | null;
  paymentTerms?: string | null;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export default function SupplierListPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/inventory/suppliers", {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuppliers(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    
    const term = searchTerm.toLowerCase();
    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(term) ||
      supplier.code.toLowerCase().includes(term) ||
      supplier.contactName?.toLowerCase().includes(term) ||
      supplier.phone?.toLowerCase().includes(term) ||
      supplier.email?.toLowerCase().includes(term)
    );
  }, [suppliers, searchTerm]);

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`Bạn có chắc muốn xóa nhà cung cấp "${supplier.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/suppliers/${supplier.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Xóa nhà cung cấp thành công!");
        loadSuppliers();
      } else {
        alert(`❌ Lỗi: ${result.error || "Không thể xóa nhà cung cấp"}`);
      }
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      alert(`❌ Lỗi: ${error.message || "Không thể xóa nhà cung cấp"}`);
    }
  };

  const handleExportExcel = async () => {
    try {
      if (filteredSuppliers.length === 0) {
        alert("Không có dữ liệu để xuất");
        return;
      }

      const XLSX = (await import("xlsx")).default;

      const exportData = filteredSuppliers.map((supplier) => ({
        "Mã nhà cung cấp": supplier.code,
        "Tên nhà cung cấp": supplier.name,
        "Người liên hệ": supplier.contactName || "",
        "Số điện thoại": supplier.phone || "",
        "Email": supplier.email || "",
        "Địa chỉ": supplier.address || "",
        "Thành phố": supplier.city || "",
        "Tỉnh/Thành phố": supplier.province || "",
        "Mã số thuế": supplier.taxCode || "",
        "Website": supplier.website || "",
        "Điều khoản thanh toán": supplier.paymentTerms || "",
        "Số sản phẩm": supplier._count?.products || 0,
        "Trạng thái": supplier.isActive ? "Hoạt động" : "Ngừng hoạt động",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DANH SÁCH NHÀ CUNG CẤP");

      const filename = `danh_sach_nha_cung_cap_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, filename);

      alert(`✅ Đã xuất ${filteredSuppliers.length} nhà cung cấp ra file Excel`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Có lỗi xảy ra khi xuất Excel");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Quản lý nhà cung cấp
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: {suppliers.length} nhà cung cấp
            {filteredSuppliers.length !== suppliers.length && (
              <span className="ml-2">
                (Hiển thị: {filteredSuppliers.length})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </Button>
          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Nhập Excel
          </Button>
          <Button
            onClick={() => {
              setEditingSupplier(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Tạo nhà cung cấp mới
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã, số điện thoại, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Supplier List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên nhà cung cấp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số sản phẩm
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm ? "Không tìm thấy nhà cung cấp nào" : "Chưa có nhà cung cấp nào"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 font-mono">
                        {supplier.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {supplier.contactName || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {supplier.phone || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {supplier.email || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900">
                        {supplier._count?.products || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          supplier.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {supplier.isActive ? "Hoạt động" : "Ngừng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Form Modal */}
      <SupplierFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        onSuccess={() => {
          loadSuppliers();
        }}
      />

      {/* Import Excel Modal */}
      <ImportSupplierExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          loadSuppliers();
        }}
      />
    </div>
  );
}
