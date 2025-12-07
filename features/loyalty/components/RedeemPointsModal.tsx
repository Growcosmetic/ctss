"use client";

import React, { useState } from "react";
import { X, Coins } from "lucide-react";

interface RedeemPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (points: number, description: string) => void;
  availablePoints: number;
  loading?: boolean;
}

export default function RedeemPointsModal({
  isOpen,
  onClose,
  onRedeem,
  availablePoints,
  loading,
}: RedeemPointsModalProps) {
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pointsNum = parseInt(points);
    if (pointsNum > 0 && pointsNum <= availablePoints) {
      onRedeem(pointsNum, description || "Đổi điểm");
      setPoints("");
      setDescription("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Đổi điểm tích lũy</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm khả dụng
            </label>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="text-lg font-bold text-gray-900">
                  {availablePoints.toLocaleString("vi-VN")} điểm
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điểm muốn đổi
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min={1}
              max={availablePoints}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập số điểm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả (tùy chọn)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Đổi voucher giảm giá 10%"
            />
          </div>

          {parseInt(points) > availablePoints && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Số điểm vượt quá số điểm khả dụng
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !points || parseInt(points) <= 0 || parseInt(points) > availablePoints}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đổi điểm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

