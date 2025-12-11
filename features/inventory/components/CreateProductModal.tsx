"use client";

import React, { useState } from "react";
import { Save, Loader2, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import ProductUnitSelector from "./ProductUnitSelector";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    subCategory: "",
    unit: "",
    capacity: null as number | null,
    capacityUnit: null as string | null,
    pricePerUnit: null as number | null,
    costPrice: null as number | null,
    minStock: null as number | null,
    maxStock: null as number | null,
    supplier: "",
    brand: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.unit) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku || undefined, // Auto-generate if empty
          category: formData.category,
          subCategory: formData.subCategory || null,
          unit: formData.unit,
          capacity: formData.capacity,
          capacityUnit: formData.capacityUnit,
          pricePerUnit: formData.pricePerUnit,
          costPrice: formData.costPrice,
          minStock: formData.minStock,
          maxStock: formData.maxStock,
          supplier: formData.supplier || null,
          brand: formData.brand || null,
          notes: formData.notes || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể tạo sản phẩm");
      }

      alert("✅ Tạo sản phẩm thành công!");
      
      // Reset form
      setFormData({
        name: "",
        sku: "",
        category: "",
        subCategory: "",
        unit: "",
        capacity: null,
        capacityUnit: null,
        pricePerUnit: null,
        costPrice: null,
        minStock: null,
        maxStock: null,
        supplier: "",
        brand: "",
        notes: "",
      });
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error creating product:", err);
      setError(err.message || "Có lỗi xảy ra khi tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo mới sản phẩm"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Thông tin sản phẩm
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã / SKU
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hệ thống sẽ tự sinh mã nếu bạn không nhập"
            />
            <p className="text-xs text-gray-500 mt-1">
              * Chú ý: Hệ thống sẽ tự sinh mã nếu bạn không nhập
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhóm sản phẩm <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn nhóm sản phẩm</option>
                <option value="Chemical">Chemical</option>
                <option value="Nhuộm">Nhuộm</option>
                <option value="Care">Care</option>
                <option value="Retail">Retail</option>
                <option value="Treatment">Treatment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục phụ
              </label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Uốn nóng, Uốn lạnh"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhãn hiệu
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập nhãn hiệu"
            />
          </div>

          {/* Đơn vị tính */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Đơn vị tính <span className="text-red-500">*</span></h4>
            <ProductUnitSelector
              countingUnit={formData.unit}
              capacity={formData.capacity}
              capacityUnit={formData.capacityUnit}
              onCountingUnitChange={(unit) => setFormData({ ...formData, unit })}
              onCapacityChange={(capacity) => setFormData({ ...formData, capacity })}
              onCapacityUnitChange={(capacityUnit) => setFormData({ ...formData, capacityUnit })}
            />
          </div>

          {/* Giá */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá nhập vào (₫)
              </label>
              <input
                type="number"
                value={formData.costPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPrice: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán sản phẩm (₫)
              </label>
              <input
                type="number"
                value={formData.pricePerUnit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricePerUnit: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Tồn kho */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tồn kho tối thiểu
              </label>
              <input
                type="number"
                value={formData.minStock || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minStock: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tồn kho tối đa
              </label>
              <input
                type="number"
                value={formData.maxStock || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxStock: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Nhà cung cấp và ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhà cung cấp
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tên nhà cung cấp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả / Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả chi tiết sản phẩm"
            />
          </div>
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
            disabled={loading || !formData.name || !formData.category || !formData.unit}
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
