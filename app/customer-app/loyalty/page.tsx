"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/features/customer-app/hooks/useCustomerAuth";
import { getLoyaltyTier, getPointsHistory } from "@/features/loyalty/services/loyaltyApi";
import CustomerNavBar from "@/features/customer-app/components/CustomerNavBar";
import LoyaltyTierBadge from "@/features/loyalty/components/LoyaltyTierBadge";
import PointsBalanceCard from "@/features/loyalty/components/PointsBalanceCard";
import PointsHistoryList from "@/features/loyalty/components/PointsHistoryList";
import TierBenefitsCard from "@/features/loyalty/components/TierBenefitsCard";
import NextTierProgressBar from "@/features/loyalty/components/NextTierProgressBar";
import { Loader2 } from "lucide-react";

export default function CustomerLoyaltyPage() {
  const { customer, authenticated, loading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const [loyalty, setLoyalty] = useState<any>(null);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push("/customer-app/login");
      return;
    }

    if (customer?.id) {
      loadLoyaltyData();
    }
  }, [customer, authenticated, authLoading]);

  const loadLoyaltyData = async () => {
    if (!customer?.id) return;
    try {
      setLoading(true);
      const [summary, history] = await Promise.all([
        getLoyaltyTier(customer.id),
        getLoyaltyHistory(customer.id),
      ]);
      setLoyalty(summary);
      setPointsHistory(history);
    } catch (error) {
      console.error("Error loading loyalty data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
          <h1 className="text-2xl font-bold">Thành viên & Điểm tích lũy</h1>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {loyalty && (
            <>
              <PointsBalanceCard loyaltySummary={loyalty} loading={false} />
              <TierBenefitsCard loyaltySummary={loyalty} loading={false} />
              <NextTierProgressBar loyaltySummary={loyalty} loading={false} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Lịch sử điểm tích lũy
                </h3>
                <PointsHistoryList history={pointsHistory} loading={false} />
              </div>
            </>
          )}
        </div>
      </div>
      <CustomerNavBar />
    </>
  );
}

