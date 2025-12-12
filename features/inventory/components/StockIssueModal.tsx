"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, Plus, Trash2, Loader2, Save, Minus, FileSpreadsheet } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  pricePerUnit: number | null;
  stock: number;
}

interface IssueItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface StockIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  branchId: string;
  issueId?: string;
}

type IssueReason = 
  | "XUAT_TIEU_HAO" 
  | "XUAT_DAO_TAO" 
  | "XUAT_BAN_HOC_VIEN" 
  | "XUAT_TRA_HANG_NCC" 
  | "XUAT_HUY_HONG_HOC" 
  | "XUAT_CHO_TANG" 
  | "XUAT_DONG_GOI" 
  | "XUAT_HANG_SVC" 
  | "XUAT_KHAC"
  | "BAN_HANG"
  | "SU_DUNG"
  | "BAN_NHAN_VIEN";

export default function StockIssueModal({
  isOpen,
  onClose,
  onSuccess,
  branchId,
  issueId,
}: StockIssueModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<Array<{ id: string; name: string; phone: string }>>([]);
  const [productSearch, setProductSearch] = useState("");
  
  const [formData, setFormData] = useState({
    reason: "XUAT_TIEU_HAO" as IssueReason,
    recipientId: null as string | null,
    recipientName: null as string | null,
    staffId: null as string | null,
    date: new Date().toISOString().split("T")[0],
    dateTime: new Date().toISOString().slice(0, 16),
    notes: "",
    status: "DRAFT" as "DRAFT" | "APPROVED" | "COMPLETED" | "CANCELLED",
  });

  const [items, setItems] = useState<IssueItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadStaff();
      if (issueId) {
        loadIssue();
      } else {
        setFormData({
          reason: "XUAT_TIEU_HAO",
          recipientId: null,
          recipientName: null,
          staffId: null,
          date: new Date().toISOString().split("T")[0],
          dateTime: new Date().toISOString().slice(0, 16),
          notes: "",
          status: "DRAFT",
        });
        setItems([]);
        setProductSearch("");
      }
    }
  }, [isOpen, issueId]);

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

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      const response = await fetch(`/api/branches/${branchId}/staff`, {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const staffList = (result.data || []).map((assignment: any) => ({
            id: assignment.staff?.id || assignment.staffId,
            name: assignment.staff?.name || "Unknown",
            phone: assignment.staff?.phone || "",
          }));
          setStaff(staffList);
        }
      }
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadIssue = async () => {
    if (!issueId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/inventory/issues/${issueId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const issue = result.data;
          setFormData({
            reason: issue.reason,
            recipientId: issue.recipientId,
            recipientName: issue.recipientName,
            staffId: issue.staffId,
            date: new Date(issue.date).toISOString().split("T")[0],
            dateTime: new Date(issue.date).toISOString().slice(0, 16),
            notes: issue.notes || "",
            status: issue.status,
          });
          setItems(
            issue.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || 0,
              notes: item.notes || "",
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error loading issue:", error);
      setError("Không thể tải phiếu xuất");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        notes: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof IssueItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === "productId") {
      item.productId = value;
      const product = products.find((p) => p.id === value);
      if (product) {
        item.unitPrice = product.pricePerUnit || 0;
        item.totalPrice = item.quantity * item.unitPrice;
      }
    } else if (field === "quantity") {
      item.quantity = Number(value) || 0;
      item.totalPrice = item.quantity * item.unitPrice;
    } else if (field === "unitPrice") {
      item.unitPrice = Number(value) || 0;
      item.totalPrice = item.quantity * item.unitPrice;
    } else {
      (item as any)[field] = value;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const url = issueId
        ? `/api/inventory/issues/${issueId}`
        : "/api/inventory/issues";
      const method = issueId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          branchId,
          reason: formData.reason,
          recipientId: formData.recipientId,
          recipientName: formData.recipientName,
          staffId: formData.staffId,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice || null,
            notes: item.notes || null,
          })),
          date: formData.dateTime || formData.date,
          notes: formData.notes || null,
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể lưu phiếu xuất");
      }

      alert(`✅ ${issueId ? "Cập nhật" : "Tạo"} phiếu xuất thành công!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error saving issue:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu phiếu xuất");
    } finally {
      setLoading(false);
    }
  };

  // Hooks must be called before any conditional returns
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: "Phiếu xuất đang xử lý",
      APPROVED: "Phiếu xuất đã duyệt",
      COMPLETED: "Phiếu xuất đã hoàn thành",
      CANCELLED: "Phiếu xuất đã hủy",
    };
    return labels[status] || status;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      XUAT_TIEU_HAO: "Xuất tiêu hao",
      XUAT_DAO_TAO: "Xuất đào tạo",
      XUAT_BAN_HOC_VIEN: "Xuất bán học viên",
      XUAT_TRA_HANG_NCC: "Xuất trả hàng NCC",
      XUAT_HUY_HONG_HOC: "Xuất huỷ vì hỏng hóc",
      XUAT_CHO_TANG: "Xuất cho/tặng",
      XUAT_DONG_GOI: "Xuất đóng gói",
      XUAT_HANG_SVC: "Xuất hàng SVC",
      XUAT_KHAC: "Xuất khác",
      BAN_HANG: "Bán hàng",
      SU_DUNG: "Sử dụng",
      BAN_NHAN_VIEN: "Bán nhân viên",
    };
    return labels[reason] || reason;
  };

  const needsRecipient = ["XUAT_BAN_HOC_VIEN", "XUAT_CHO_TANG", "BAN_NHAN_VIEN"].includes(formData.reason);
  const needsStaff = ["XUAT_DAO_TAO", "BAN_NHAN_VIEN"].includes(formData.reason);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={issueId ? "Sửa phiếu xuất kho" : "Tạo phiếu xuất kho"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Header Info - 2 Columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã phiếu xuất
              </label>
              <input
                type="text"
                value="<tự động sinh mã phiếu>"
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
                Xuất từ kho <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={branchId}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ghi chú về phiếu xuất..."
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "DRAFT" | "APPROVED" | "COMPLETED" | "CANCELLED",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">{getStatusLabel("DRAFT")}</option>
                <option value="APPROVED">{getStatusLabel("APPROVED")}</option>
                <option value="COMPLETED">{getStatusLabel("COMPLETED")}</option>
                <option value="CANCELLED">{getStatusLabel("CANCELLED")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người nhận
              </label>
              <select
                value={formData.recipientId || ""}
                onChange={(e) => {
                  const selectedStaff = staff.find((s) => s.id === e.target.value);
                  setFormData({
                    ...formData,
                    recipientId: e.target.value || null,
                    recipientName: selectedStaff?.name || null,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn người nhận</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
              {!formData.recipientId && needsRecipient && (
                <input
                  type="text"
                  value={formData.recipientName || ""}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="Hoặc nhập tên người nhận"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày xuất <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => {
                  const dt = e.target.value;
                  setFormData({
                    ...formData,
                    dateTime: dt,
                    date: dt.split("T")[0],
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phân loại xuất <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reason}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reason: e.target.value as IssueReason,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="XUAT_TIEU_HAO">{getReasonLabel("XUAT_TIEU_HAO")}</option>
                <option value="XUAT_DAO_TAO">{getReasonLabel("XUAT_DAO_TAO")}</option>
                <option value="XUAT_BAN_HOC_VIEN">{getReasonLabel("XUAT_BAN_HOC_VIEN")}</option>
                <option value="XUAT_TRA_HANG_NCC">{getReasonLabel("XUAT_TRA_HANG_NCC")}</option>
                <option value="XUAT_HUY_HONG_HOC">{getReasonLabel("XUAT_HUY_HONG_HOC")}</option>
                <option value="XUAT_CHO_TANG">{getReasonLabel("XUAT_CHO_TANG")}</option>
                <option value="XUAT_DONG_GOI">{getReasonLabel("XUAT_DONG_GOI")}</option>
                <option value="XUAT_HANG_SVC">{getReasonLabel("XUAT_HANG_SVC")}</option>
                <option value="XUAT_KHAC">{getReasonLabel("XUAT_KHAC")}</option>
                <option value="BAN_HANG">{getReasonLabel("BAN_HANG")}</option>
                <option value="SU_DUNG">{getReasonLabel("SU_DUNG")}</option>
                <option value="BAN_NHAN_VIEN">{getReasonLabel("BAN_NHAN_VIEN")}</option>
              </select>
            </div>
            {needsStaff && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhân viên
                </label>
                <select
                  value={formData.staffId || ""}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Product Search and Add */}
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
                    Sản phẩm <span className="text-red-500">*</span>
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Tồn kho
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Số lượng
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Giá
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                    Tổng tiền
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
                        {product ? (
                          <span className={stock <= 0 ? "text-red-600 font-semibold" : ""}>
                            {stock.toLocaleString("vi-VN")} {product.unit}
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
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
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="font-semibold">
                          {item.totalPrice.toLocaleString("vi-VN")} ₫
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">
                    Tổng cộng:
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {totalAmount.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="border border-gray-300"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Nhập từ Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          {!issueId && (
            <Button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                const form = e.currentTarget.closest("form");
                if (form) {
                  setFormData({ ...formData, status: "DRAFT" });
                  const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
                  form.dispatchEvent(submitEvent);
                }
              }}
              disabled={loading}
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu Nháp
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {issueId ? "Cập nhật" : "Hoàn Thành"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
