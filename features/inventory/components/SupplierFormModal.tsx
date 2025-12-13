"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, Building2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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
  country?: string | null;
  taxCode?: string | null;
  website?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  isActive: boolean;
}

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  onSuccess?: () => void;
}

export default function SupplierFormModal({
  isOpen,
  onClose,
  supplier,
  onSuccess,
}: SupplierFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    country: "VN",
    taxCode: "",
    website: "",
    paymentTerms: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          code: supplier.code || "",
          name: supplier.name || "",
          contactName: supplier.contactName || "",
          phone: supplier.phone || "",
          email: supplier.email || "",
          address: supplier.address || "",
          city: supplier.city || "",
          province: supplier.province || "",
          country: supplier.country || "VN",
          taxCode: supplier.taxCode || "",
          website: supplier.website || "",
          paymentTerms: supplier.paymentTerms || "",
          notes: supplier.notes || "",
          isActive: supplier.isActive ?? true,
        });
      } else {
        setFormData({
          code: "",
          name: "",
          contactName: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          province: "",
          country: "VN",
          taxCode: "",
          website: "",
          paymentTerms: "",
          notes: "",
          isActive: true,
        });
      }
      setError("");
    }
  }, [isOpen, supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Tên nhà cung cấp là bắt buộc");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = supplier
        ? `/api/inventory/suppliers/${supplier.id}`
        : "/api/inventory/suppliers";
      const method = supplier ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể lưu nhà cung cấp");
      }

      alert(`✅ ${supplier ? "Cập nhật" : "Tạo"} nhà cung cấp thành công!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error saving supplier:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? "Chỉnh sửa nhà cung cấp" : "Tạo mới nhà cung cấp"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Thông tin cơ bản
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã nhà cung cấp
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hệ thống sẽ tự sinh mã nếu để trống"
              />
              <p className="text-xs text-gray-500 mt-1">
                * Để trống để hệ thống tự sinh mã
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên nhà cung cấp"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người liên hệ
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tên người liên hệ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Số điện thoại"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-6">
            Địa chỉ
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Số nhà, đường"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thành phố
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Thành phố"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố
              </label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tỉnh/TP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quốc gia
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VN"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mt-6">
            Thông tin khác
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã số thuế
              </label>
              <input
                type="text"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mã số thuế"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điều khoản thanh toán
            </label>
            <input
              type="text"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Net 30, COD, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú về nhà cung cấp"
            />
          </div>

          {supplier && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Đang hoạt động
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu thông tin
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
