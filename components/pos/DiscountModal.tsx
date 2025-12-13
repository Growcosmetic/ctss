"use client";

import React, { useState, useEffect } from "react";
import { Tag, Percent } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (discount: number, voucherCode?: string) => void;
  currentDiscount: number;
  subtotal: number;
}

export default function DiscountModal({
  isOpen,
  onClose,
  onApply,
  currentDiscount,
  subtotal,
}: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
  const [discountValue, setDiscountValue] = useState("");
  const [voucherCode, setVoucherCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setDiscountValue(currentDiscount > 0 ? currentDiscount.toString() : "");
      setVoucherCode("");
      setDiscountType("amount");
    }
  }, [isOpen, currentDiscount]);

  const handleApply = () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value < 0) return;

    let finalDiscount = value;
    if (discountType === "percent") {
      finalDiscount = (subtotal * value) / 100;
    }

    // Ensure discount doesn't exceed subtotal
    finalDiscount = Math.min(finalDiscount, subtotal);

    onApply(finalDiscount, voucherCode || undefined);
    onClose();
  };

  const maxDiscount = discountType === "percent" ? 100 : subtotal;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Áp dụng giảm giá"
      size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            disabled={!discountValue || isNaN(parseFloat(discountValue)) || parseFloat(discountValue) <= 0}
            className="flex-1"
          >
            Áp dụng
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giảm giá
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={discountType === "amount" ? "primary" : "outline"}
                onClick={() => setDiscountType("amount")}
                className="flex items-center justify-center gap-2"
              >
                <Tag size={18} />
                Số tiền
              </Button>
              <Button
                variant={discountType === "percent" ? "primary" : "outline"}
                onClick={() => setDiscountType("percent")}
                className="flex items-center justify-center gap-2"
              >
                <Percent size={18} />
                Phần trăm
              </Button>
            </div>
          </div>

          {/* Discount Value */}
          <div>
            <Input
              label={discountType === "amount" ? "Số tiền giảm (₫)" : "Phần trăm giảm (%)"}
              type="number"
              min="0"
              max={maxDiscount}
              step={discountType === "percent" ? "1" : "1000"}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "amount" ? "Nhập số tiền" : "Nhập phần trăm"}
              helperText={`Tối đa: ${discountType === "amount" ? `${maxDiscount.toLocaleString()}₫` : `${maxDiscount}%`}`}
            />
          </div>

          {/* Voucher Code (Optional) */}
          <div>
            <Input
              label="Mã voucher (tùy chọn)"
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã voucher"
            />
          </div>

          {/* Preview */}
          {discountValue && !isNaN(parseFloat(discountValue)) && (
            <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm text-gray-600">
                Giảm giá:{" "}
                <span className="font-semibold text-primary-700">
                  {discountType === "amount"
                    ? `${parseFloat(discountValue).toLocaleString()}₫`
                    : `${discountValue}%`}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tổng sau giảm:{" "}
                <span className="font-semibold">
                  {(subtotal - (discountType === "amount" ? parseFloat(discountValue) : (subtotal * parseFloat(discountValue)) / 100)).toLocaleString()}₫
                </span>
              </p>
            </div>
          )}
      </div>
    </Modal>
  );
}

