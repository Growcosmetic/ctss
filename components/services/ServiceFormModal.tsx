"use client";

import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ServiceFormData {
  name: string;
  code?: string;
  description?: string;
  category: string;
  englishName?: string;
  englishDescription?: string;
  duration: number;
  price: number;
  cost?: number;
  image?: string;
  isActive: boolean;
  allowPriceOverride: boolean;
  unit?: string;
  displayLocation?: string;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: any | null;
  categories?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export default function ServiceFormModal({
  isOpen,
  onClose,
  service,
  categories = [],
  onSuccess,
}: ServiceFormModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    code: "",
    description: "",
    category: "",
    englishName: "",
    englishDescription: "",
    duration: 30,
    price: 0,
    cost: 0,
    image: "",
    isActive: true,
    allowPriceOverride: false,
    unit: "",
    displayLocation: "BOTH",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (service) {
      // Edit mode
      const activePrice = service.servicePrices?.find((p: any) => p.isActive);
      setFormData({
        name: service.name || "",
        code: service.code || "",
        description: service.description || "",
        category: service.category?.id || service.category || "",
        englishName: service.englishName || "",
        englishDescription: service.englishDescription || "",
        duration: service.duration || 30,
        price: activePrice?.price || service.price || 0,
        cost: activePrice?.cost || service.cost || 0,
        image: service.image || "",
        isActive: service.isActive !== undefined ? service.isActive : true,
        allowPriceOverride: service.allowPriceOverride || false,
        unit: service.unit || "",
        displayLocation: service.displayLocation || "BOTH",
      });
    } else {
      // Create mode
      setFormData({
        name: "",
        code: "",
        description: "",
        category: categories[0]?.id || "",
        allowPriceOverride: false,
        unit: "",
        displayLocation: "BOTH",
        englishName: "",
        englishDescription: "",
        duration: 30,
        price: 0,
        cost: 0,
        image: "",
        isActive: true,
      });
    }
    setError("");
  }, [service, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = service ? `/api/services/${service.id}` : "/api/services";
      const method = service ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code || undefined,
          description: formData.description || undefined,
          category: formData.category,
          categoryId: formData.category,
          englishName: formData.englishName || undefined,
          englishDescription: formData.englishDescription || undefined,
          duration: formData.duration,
          price: formData.price,
          cost: formData.cost || undefined,
          image: formData.image || undefined,
          isActive: formData.isActive,
          allowPriceOverride: formData.allowPriceOverride,
          unit: formData.unit || undefined,
          displayLocation: formData.displayLocation || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi lưu dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tên dịch vụ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên dịch vụ <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên dịch vụ"
            required
          />
        </div>

        {/* Mã dịch vụ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã dịch vụ
          </label>
          <Input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="VD: DV10001"
          />
        </div>

        {/* Danh mục */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhóm dịch vụ <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Chọn nhóm dịch vụ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Nhập mô tả dịch vụ"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Tên tiếng Anh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên tiếng Anh (nếu có)
          </label>
          <Input
            type="text"
            value={formData.englishName}
            onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
            placeholder="English name"
          />
        </div>

        {/* Mô tả tiếng Anh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả bằng Tiếng Anh (nếu có)
          </label>
          <textarea
            value={formData.englishDescription}
            onChange={(e) => setFormData({ ...formData, englishDescription: e.target.value })}
            placeholder="English description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Thời lượng và Giá */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời lượng (phút) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
              }
              placeholder="30"
              min={1}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán (VNĐ) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
              min={0}
              required
            />
          </div>
        </div>

        {/* Giá vốn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá vốn (VNĐ)
          </label>
          <Input
            type="number"
            value={formData.cost || 0}
            onChange={(e) =>
              setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })
            }
            placeholder="0"
            min={0}
          />
        </div>

        {/* Hình ảnh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL hình ảnh
          </label>
          <Input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Đơn vị tính */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đơn vị tính
          </label>
          <Input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="Ví dụ: lần, giờ, ngày, gói..."
          />
        </div>

        {/* Tùy chọn hiển thị */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tùy chọn hiển thị
          </label>
          <select
            value={formData.displayLocation}
            onChange={(e) => setFormData({ ...formData, displayLocation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="BOTH">Cả POS và Booking</option>
            <option value="POS">Chỉ POS</option>
            <option value="BOOKING">Chỉ Booking</option>
            <option value="NONE">Ẩn</option>
          </select>
        </div>

        {/* Trạng thái */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Dịch vụ đang hoạt động
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowPriceOverride}
              onChange={(e) =>
                setFormData({ ...formData, allowPriceOverride: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Cho phép sửa giá khi thanh toán
            </span>
          </label>
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
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Đang lưu..." : service ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
