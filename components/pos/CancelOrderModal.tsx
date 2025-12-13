"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
}: CancelOrderModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận hủy đơn hàng"
      size="sm"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Không
          </Button>
          <Button variant="danger" onClick={handleConfirm} className="flex-1">
            Xác nhận hủy
          </Button>
        </div>
      }
    >
      <div>
        <p className="text-gray-600 mb-2">
          Bạn có chắc muốn hủy đơn hàng này?
        </p>
        <p className="text-sm text-gray-500">
          Đơn hàng có <span className="font-semibold text-gray-700">{itemCount}</span> sản phẩm/dịch vụ sẽ bị xóa và không thể khôi phục.
        </p>
      </div>
    </Modal>
  );
}

