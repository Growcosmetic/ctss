"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, Plus, Trash2, Loader2, Save, Minus, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  stock: number;
}

interface TransferItem {
  productId: string;
  quantity: number;
  costPrice: number | null;
  notes?: string;
}

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  fromBranchId: string;
}

export default function StockTransferModal({
  isOpen,
  onClose,
  onSuccess,
  fromBranchId,
}: StockTransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [productSearch, setProductSearch] = useState("");
  
  const [formData, setFormData] = useState({
    toBranchId: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [items, setItems] = useState<TransferItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadBranches();
      setFormData({
        toBranchId: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setItems([]);
      setProductSearch("");
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/inventory/product/list?isActive=true", {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProducts(result.products || []);
        }
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await fetch("/api/branches", {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Filter out current branch
          const allBranches = result.data || [];
          setBranches(allBranches.filter((b: any) => b.id !== fromBranchId));
        }
      }
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        costPrice: null,
        notes: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof TransferItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === "productId") {
      item.productId = value;
      const product = products.find((p) => p.id === value);
      if (product) {
        // Get cost price from product
        item.costPrice = null; // Will be set from API
      }
    } else if (field === "quantity") {
      item.quantity = Number(value) || 0;
    } else {
      (item as any)[field] = value;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.toBranchId) {
      setError("Vui lòng chọn kho đích");
      return;
    }

    if (items.length === 0) {
      setError("Vui lòng thêm ít nhất một sản phẩm");
      return;
    }

    for (const item of items) {
      if (!item.productId || item.quantity <= 0) {
        setError("Vui lòng điền đầy đủ thông tin cho tất cả sản phẩm");
        return;
      }

      // Check stock availability
      const product = products.find((p) => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        setError(
          `Không đủ tồn kho cho sản phẩm "${product.name}". Tồn kho hiện tại: ${product.stock} ${product.unit}`
        );
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fromBranchId,
          toBranchId: formData.toBranchId,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes || null,
          })),
          notes: formData.notes || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể tạo phiếu chuyển kho");
      }

      alert("✅ Tạo phiếu chuyển kho thành công!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error creating transfer:", err);
      setError(err.message || "Có lỗi xảy ra khi tạo phiếu chuyển kho");
    } finally {
      setLoading(false);
    }
  };

  // Hooks must be called before any conditional returns
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const search = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search)
    );
  }, [products, productSearch]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xuất sang kho nội bộ"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã phiếu
            </label>
            <input
              type="text"
              value="Mã tự sinh"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Được tạo bởi
            </label>
            <input
              type="text"
              value="Hệ thống"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập vào kho <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.toBranchId}
              onChange={(e) => setFormData({ ...formData, toBranchId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Chọn kho đích --</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày nhập kho
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Section Title */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Danh sách sản phẩm chuyển sang kho nội bộ
          </h3>
        </div>

        {/* Product Search */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Button>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    STT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Tên sản phẩm
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    SKU
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Phân loại
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Tình trạng
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Dung tích/SL
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Giá nhập
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Số lượng
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId);
                  const stock = product?.stock || 0;
                  const isLowStock = stock < item.quantity;
                  
                  return (
                    <tr key={index} className={isLowStock ? "bg-red-50" : ""}>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, "productId", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Tìm kiếm sản phẩm</option>
                          {filteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku ? `${p.sku} - ` : ""}{p.name} ({p.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="text-sm text-gray-900">
                          {product?.sku || "--"}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <select className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Công cụ</option>
                          <option>Hóa chất</option>
                          <option>Khác</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <select className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Mới</option>
                          <option>Đã qua sử dụng</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="text-sm text-gray-900">
                          {product ? `0 ${product.unit}` : "--"}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.costPrice || ""}
                          onChange={(e) => updateItem(index, "costPrice", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0 ₫"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateItem(index, "quantity", Math.max(1, item.quantity - 1))}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={product ? product.stock : undefined}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            className={`w-16 px-2 py-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isLowStock ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            required
                          />
                          <span className="text-sm text-gray-600">{product?.unit || ""}</span>
                          <button
                            type="button"
                            onClick={() => updateItem(index, "quantity", item.quantity + 1)}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {isLowStock && (
                          <p className="text-xs text-red-600 mt-1">
                            Không đủ tồn kho!
                          </p>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Duplicate item
                              const newItem = { ...item };
                              setItems([...items, newItem]);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-2">
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Thêm dòng mới
              </button>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Ghi chú về phiếu chuyển kho..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Nhập vào kho
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
