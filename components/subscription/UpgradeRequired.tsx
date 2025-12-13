"use client";

import { AlertCircle, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { useState } from "react";

interface UpgradeRequiredProps {
  feature?: string;
  limit?: string;
  current?: number;
  max?: number;
  message?: string;
  onClose?: () => void;
  showModal?: boolean;
}

/**
 * Phase 8.5 - Upgrade Required Component
 * 
 * Displays a user-friendly message when a feature is not available
 * or a limit is exceeded. Shows upgrade CTA.
 */
export default function UpgradeRequired({
  feature,
  limit,
  current,
  max,
  message,
  onClose,
  showModal = false,
}: UpgradeRequiredProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(showModal);

  const handleUpgrade = () => {
    router.push("/system/subscription");
    setIsModalOpen(false);
    onClose?.();
  };

  const handleClose = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  // Determine message
  let displayMessage = message;
  if (!displayMessage) {
    if (feature) {
      displayMessage = `Tính năng "${feature}" không có sẵn trong gói hiện tại của bạn.`;
    } else if (limit && current !== undefined && max !== undefined) {
      displayMessage = `Bạn đã đạt giới hạn ${limit} (${current}/${max}). Vui lòng nâng cấp để tiếp tục sử dụng.`;
    } else if (limit) {
      displayMessage = `Bạn đã đạt giới hạn ${limit}. Vui lòng nâng cấp để tiếp tục sử dụng.`;
    } else {
      displayMessage = "Gói dịch vụ hiện tại không hỗ trợ tính năng này. Vui lòng nâng cấp để tiếp tục.";
    }
  }

  return (
    <>
      {/* Inline Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-1">Cần nâng cấp</h3>
          <p className="text-sm text-yellow-800 mb-3">{displayMessage}</p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              <ArrowUp size={16} className="mr-2" />
              Nâng cấp ngay
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Đóng
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title="Nâng cấp gói dịch vụ"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Đóng
            </Button>
            <Button variant="primary" onClick={handleUpgrade}>
              <ArrowUp size={16} className="mr-2" />
              Đi đến trang nâng cấp
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cần nâng cấp gói dịch vụ</h3>
              <p className="text-gray-700 mb-4">{displayMessage}</p>
              {limit && current !== undefined && max !== undefined && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{limit}</span>
                    <span className="text-sm text-gray-600">
                      {current} / {max >= 999999 ? "Không giới hạn" : max}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (current / max) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600">
                Nâng cấp ngay để mở khóa tính năng này và tăng giới hạn sử dụng.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

/**
 * Empty State Component for Gated Features
 */
export function GatedFeatureEmptyState({
  feature,
  icon: Icon = AlertCircle,
  actionLabel = "Nâng cấp ngay",
}: {
  feature: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  actionLabel?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-yellow-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Tính năng không khả dụng
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        Tính năng "{feature}" không có sẵn trong gói hiện tại của bạn. Nâng cấp để mở khóa tính năng này.
      </p>
      <Button variant="primary" onClick={() => router.push("/system/subscription")}>
        <ArrowUp size={16} className="mr-2" />
        {actionLabel}
      </Button>
    </div>
  );
}

