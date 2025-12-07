"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useCRM } from "../hooks/useCRM";
import { useMina } from "@/features/mina/hooks/useMina";
import CustomerInfoCard from "./CustomerInfoCard";
import CustomerTags from "./CustomerTags";
import CustomerNotes from "./CustomerNotes";
import CustomerHistory from "./CustomerHistory";
import MinaCustomerSummaryCard from "@/features/mina/components/MinaCustomerSummaryCard";
import MinaSuggestionsCard from "@/features/mina/components/MinaSuggestionsCard";
import MinaRiskIndicator from "@/features/mina/components/MinaRiskIndicator";
import LoyaltyTierBadge from "@/features/loyalty/components/LoyaltyTierBadge";
import PointsBalanceCard from "@/features/loyalty/components/PointsBalanceCard";
import PointsHistoryList from "@/features/loyalty/components/PointsHistoryList";
import TierBenefitsCard from "@/features/loyalty/components/TierBenefitsCard";
import NextTierProgressBar from "@/features/loyalty/components/NextTierProgressBar";
import { getLoyaltyTier, getPointsHistory } from "@/features/loyalty/services/loyaltyApi";
import { LoyaltySummary } from "@/features/loyalty/types";

interface CustomerProfileProps {
  customerId?: string;
  customerPhone?: string;
  onClose: () => void;
  onCustomerUpdate?: () => void;
}

export default function CustomerProfile({
  customerId,
  customerPhone,
  onClose,
  onCustomerUpdate,
}: CustomerProfileProps) {
  const {
    loading,
    error,
    customer,
    loadCustomer,
    updateCustomer,
    addTagToCustomer,
    removeTagFromCustomer,
  } = useCRM();

  const {
    loading: minaLoading,
    customerSummary,
    serviceSuggestions,
    churnRisk,
    getCustomerSummary,
    getServiceSuggestions,
    getChurnRisk,
  } = useMina();

  const [loyaltySummary, setLoyaltySummary] = useState<LoyaltySummary | null>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);

  useEffect(() => {
    if (customerId || customerPhone) {
      loadCustomer(customerPhone, customerId);
    }
  }, [customerId, customerPhone]);

  // Load MINA data when customer is loaded
  useEffect(() => {
    if (customer?.id) {
      getCustomerSummary(customer.id);
      getServiceSuggestions(customer.id);
      getChurnRisk(customer.id);
    }
  }, [customer?.id]);

  // Load loyalty data when customer is loaded
  useEffect(() => {
    if (customer?.id) {
      loadLoyaltyData();
    }
  }, [customer?.id]);

  const loadLoyaltyData = async () => {
    if (!customer?.id) return;
    try {
      setLoyaltyLoading(true);
      const summary = await getLoyaltyTier(customer.id);
      setLoyaltySummary(summary);
    } catch (error) {
      console.error("Error loading loyalty data:", error);
    } finally {
      setLoyaltyLoading(false);
    }
  };

  const handleUpdateNotes = async (notes: string) => {
    if (!customer) return;
    await updateCustomer({
      id: customer.id,
      notes,
    });
    onCustomerUpdate?.();
  };

  const handleAddTag = async (label: string, color?: string) => {
    if (!customer) return;
    await addTagToCustomer({
      customerId: customer.id,
      label,
      color,
    });
    onCustomerUpdate?.();
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!customer) return;
    await removeTagFromCustomer(customer.id, tagId);
    onCustomerUpdate?.();
  };

  if (loading && !customer) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang tải thông tin khách hàng...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Hồ sơ khách hàng</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="flex items-center justify-between">
              <CustomerInfoCard customer={customer} />
              {loyaltySummary?.currentTier && (
                <div className="ml-4">
                  <LoyaltyTierBadge tier={loyaltySummary.currentTier} size="lg" />
                </div>
              )}
            </div>

            {/* Loyalty Section */}
            {loyaltySummary && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PointsBalanceCard loyalty={loyaltySummary.customerLoyalty} />
                <TierBenefitsCard tier={loyaltySummary.currentTier} />
              </div>
            )}

            {loyaltySummary && (
              <NextTierProgressBar
                currentTier={loyaltySummary.currentTier}
                nextTier={loyaltySummary.nextTier}
                spendingLast6Months={loyaltySummary.spendingLast6Months}
                pointsToNextTier={loyaltySummary.pointsToNextTier}
              />
            )}

            {loyaltySummary && loyaltySummary.pointsHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Lịch sử điểm tích lũy</h3>
                <PointsHistoryList history={loyaltySummary.pointsHistory} loading={loyaltyLoading} />
              </div>
            )}

            {/* MINA AI Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MinaCustomerSummaryCard summary={customerSummary} loading={minaLoading} />
              <MinaRiskIndicator risk={churnRisk} loading={minaLoading} />
            </div>

            <MinaSuggestionsCard
              suggestions={serviceSuggestions}
              loading={minaLoading}
            />

            {/* Tags and Notes Row */}
            <div className="grid grid-cols-2 gap-4">
              <CustomerTags
                tags={customer.tags || []}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                loading={loading}
              />
              <CustomerNotes
                notes={customer.notes}
                onSave={handleUpdateNotes}
                loading={loading}
              />
            </div>

            {/* History */}
            <CustomerHistory customer={customer} />
          </div>
        </div>
      </div>
    </div>
  );
}

