"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Sparkles, AlertTriangle, TrendingUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AlertExplanation {
  cause: string;
  risk: string;
  suggestedAction: string;
}

interface AlertExplainModalProps {
  alertId: string;
  alertTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertExplainModal({
  alertId,
  alertTitle,
  isOpen,
  onClose,
}: AlertExplainModalProps) {
  const [explanation, setExplanation] = useState<AlertExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    if (isOpen && alertId) {
      fetchExplanation();
    } else {
      // Reset state when modal closes
      setExplanation(null);
      setError(null);
      setCached(false);
    }
  }, [isOpen, alertId]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ai/alert-explain?alertId=${alertId}`);
      const result = await res.json();

      if (result.success) {
        setExplanation(result.data.explanation);
        setCached(result.data.cached || false);
      } else {
        setError(result.error || "Failed to load explanation");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load explanation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <span>Giải thích cảnh báo</span>
        </div>
      }
      description={alertTitle}
      footer={
        <Button variant="primary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <span className="ml-3 text-gray-600">Đang tạo giải thích...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Lỗi</p>
            <p className="text-red-700 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchExplanation}
              className="mt-3"
            >
              Thử lại
            </Button>
          </div>
        )}

        {explanation && !loading && (
          <>
            {cached && (
              <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <span>Đã lưu cache</span>
              </div>
            )}

            {/* Cause */}
            <div>
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <h4 className="font-semibold text-gray-900">Nguyên nhân</h4>
              </div>
              <p className="text-gray-700 leading-relaxed pl-7">{explanation.cause}</p>
            </div>

            {/* Risk */}
            <div>
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <h4 className="font-semibold text-gray-900">Rủi ro</h4>
              </div>
              <p className="text-gray-700 leading-relaxed pl-7">{explanation.risk}</p>
            </div>

            {/* Suggested Action */}
            <div>
              <div className="flex items-start gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <h4 className="font-semibold text-gray-900">Hành động đề xuất</h4>
              </div>
              <p className="text-gray-700 leading-relaxed pl-7">{explanation.suggestedAction}</p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

