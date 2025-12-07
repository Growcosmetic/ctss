"use client";

import React, { useState, useEffect } from "react";
import { getLoyaltyPoints, getLoyaltyTier, redeemPoints } from "../services/loyaltyApi";
import { CustomerLoyalty, LoyaltySummary } from "../types";
import LoyaltyTierBadge from "./LoyaltyTierBadge";
import PointsBalanceCard from "./PointsBalanceCard";
import RedeemPointsModal from "./RedeemPointsModal";
import { Coins, Award, Percent } from "lucide-react";
import { Loader2 } from "lucide-react";

interface LoyaltyPanelProps {
  customerId: string;
  onRedeemPoints?: (points: number) => void;
  onApplyTierDiscount?: (discountPercent: number) => void;
}

export default function LoyaltyPanel({
  customerId,
  onRedeemPoints,
  onApplyTierDiscount,
}: LoyaltyPanelProps) {
  const [loyalty, setLoyalty] = useState<CustomerLoyalty | null>(null);
  const [summary, setSummary] = useState<LoyaltySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loadLoyaltyData();
  }, [customerId]);

  const loadLoyaltyData = async () => {
    try {
      setLoading(true);
      const [loyaltyData, summaryData] = await Promise.all([
        getLoyaltyPoints(customerId),
        getLoyaltyTier(customerId),
      ]);
      setLoyalty(loyaltyData);
      setSummary(summaryData);

      // Auto-apply tier discount if available
      if (summaryData.currentTier && summaryData.currentTier.discountPercent > 0) {
        onApplyTierDiscount?.(Number(summaryData.currentTier.discountPercent));
      }
    } catch (error) {
      console.error("Error loading loyalty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (points: number, description: string) => {
    try {
      setRedeeming(true);
      await redeemPoints({ customerId, points, description });
      onRedeemPoints?.(points);
      await loadLoyaltyData(); // Reload
      setShowRedeemModal(false);
    } catch (error: any) {
      alert(error.message || "Lỗi khi đổi điểm");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!loyalty || !summary) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Thành viên
          </h3>
          {summary.currentTier && (
            <LoyaltyTierBadge tier={summary.currentTier} size="sm" />
          )}
        </div>

        <PointsBalanceCard loyalty={loyalty} />

        {summary.currentTier && summary.currentTier.discountPercent > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                Giảm giá {Number(summary.currentTier.discountPercent)}% tự động áp dụng
              </span>
            </div>
          </div>
        )}

        {loyalty.totalPoints > 0 && (
          <button
            onClick={() => setShowRedeemModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Coins className="w-4 h-4" />
            <span>Đổi điểm tích lũy</span>
          </button>
        )}
      </div>

      <RedeemPointsModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onRedeem={handleRedeem}
        availablePoints={loyalty.totalPoints}
        loading={redeeming}
      />
    </>
  );
}

