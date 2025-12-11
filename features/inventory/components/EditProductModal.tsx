"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProductStock } from "../types";
import ProductUnitSelector from "./ProductUnitSelector";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: ProductStock | null;
  onSuccess?: () => void;
}

export default function EditProductModal({
  isOpen,
  onClose,
  stock,
  onSuccess,
}: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subCategory: "",
    unit: "",
    capacity: null as number | null,
    capacityUnit: null as string | null,
    pricePerUnit: null as number | null,
    minStock: null as number | null,
    maxStock: null as number | null,
    supplier: "",
    notes: "",
  });

  // Fetch product details when modal opens
  useEffect(() => {
    if (isOpen && stock?.productId) {
      fetchProductDetails();
    }
  }, [isOpen, stock?.productId]);

  const fetchProductDetails = async () => {
    if (!stock?.productId) return;

    setFetching(true);
    try {
      const response = await fetch(`/api/inventory/product/${stock.productId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Không thể tải thông tin sản phẩm");
      }

      const result = await response.json();
      if (result.success && result.data) {
        const product = result.data;
        setFormData({
          name: product.name || "",
          category: product.category || "",
          subCategory: product.subCategory || "",
          unit: product.unit || "",
          capacity: product.capacity || null,
          capacityUnit: product.capacityUnit || null,
          pricePerUnit: product.pricePerUnit || null,
          minStock: product.minStock || null,
          maxStock: product.maxStock || null,
          supplier: product.supplier || "",
          notes: product.notes || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
      setError(err.message || "Không thể tải thông tin sản phẩm");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock?.productId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/inventory/product/${stock.productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          subCategory: formData.subCategory,
          unit: formData.unit,
          capacity: formData.capacity,
          capacityUnit: formData.capacityUnit,
          pricePerUnit: formData.pricePerUnit,
          minStock: formData.minStock,
          maxStock: formData.maxStock,
          supplier: formData.supplier || null,
          notes: formData.notes || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể cập nhật sản phẩm");
      }

      alert("✅ Cập nhật sản phẩm thành công!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error updating product:", err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa sản phẩm"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Đang tải thông tin sản phẩm...</span>
          </div>
        ) : (
          <>
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Thông tin sản phẩm
              </h3>

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
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn danh mục</option>
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

              {/* Đơn vị tính */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Đơn vị tính</h4>
                <ProductUnitSelector
                  countingUnit={formData.unit}
                  capacity={formData.capacity}
                  capacityUnit={formData.capacityUnit}
                  onCountingUnitChange={(unit) => setFormData({ ...formData, unit })}
                  onCapacityChange={(capacity) => setFormData({ ...formData, capacity })}
                  onCapacityUnitChange={(capacityUnit) => setFormData({ ...formData, capacityUnit })}
                />
              </div>

              {/* Giá và tồn kho */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá bán (₫)
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
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ghi chú về sản phẩm"
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
          </>
        )}
      </form>
    </Modal>
  );
}
