"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProductStock } from "../types";
import LocationSelector from "./LocationSelector";
import { Loader2, MapPin } from "lucide-react";

interface AssignLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: ProductStock | null;
  onSuccess?: () => void;
}

export default function AssignLocationModal({
  isOpen,
  onClose,
  stock,
  onSuccess,
}: AssignLocationModalProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && stock) {
      setSelectedLocationId(stock.locationId || null);
      setError("");
    }
  }, [isOpen, stock]);

  const handleSubmit = async () => {
    if (!stock) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/inventory/stock/${stock.id}/location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          locationId: selectedLocationId || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể cập nhật vị trí");
      }

      alert("✅ Cập nhật vị trí thành công!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error updating location:", err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật vị trí");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !stock) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gán vị trí cho sản phẩm"
      size="md"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Product Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Sản phẩm</h3>
          <p className="text-sm text-gray-700">{stock.product?.name || "Unknown"}</p>
          {stock.product?.sku && (
            <p className="text-xs text-gray-500 mt-1">SKU: {stock.product.sku}</p>
          )}
        </div>

        {/* Current Location */}
        {stock.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-medium">Vị trí hiện tại: </span>
              <span>{stock.location.code}</span>
              {(stock.location.zone || stock.location.rack) && (
                <span className="text-gray-500 ml-1">
                  ({[stock.location.zone, stock.location.rack, stock.location.shelf, stock.location.bin]
                    .filter(Boolean)
                    .join(" - ")})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Location Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn vị trí mới
          </label>
          <LocationSelector
            branchId={stock.branchId}
            value={selectedLocationId}
            onChange={setSelectedLocationId}
          />
          <p className="text-xs text-gray-500 mt-2">
            Chọn vị trí trong kho để dễ dàng tìm kiếm sản phẩm. Có thể để trống nếu chưa cần gán vị trí.
          </p>
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
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Lưu vị trí
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
