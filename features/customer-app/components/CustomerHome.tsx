"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { getCustomerBookings } from "../services/customerApi";
import { getLoyaltyTier } from "@/features/loyalty/services/loyaltyApi";
import { getLoyaltySummary } from "@/features/loyalty/services/loyaltyEngine";
import { getMinaRecommendations } from "../services/customerApi";
import NextBookingCard from "./NextBookingCard";
import LoyaltySummaryCard from "./LoyaltySummaryCard";
import QuickActionsGrid from "./QuickActionsGrid";
import { CustomerBooking, CustomerLoyaltyInfo, MinaRecommendation } from "../types";
import { Loader2, Sparkles } from "lucide-react";

export default function CustomerHome() {
  const { customer } = useCustomerAuth();
  const [nextBooking, setNextBooking] = useState<CustomerBooking | null>(null);
  const [loyalty, setLoyalty] = useState<CustomerLoyaltyInfo | null>(null);
  const [recommendations, setRecommendations] = useState<MinaRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [customer]);

  const loadData = async () => {
    if (!customer?.id) return;

    try {
      setLoading(true);
      const [bookings, loyaltyData, recommendationsData] = await Promise.all([
        getCustomerBookings("upcoming"),
        getLoyaltyTier(customer.id).catch(() => null),
        getMinaRecommendations().catch(() => []),
      ]);

      setNextBooking(bookings[0] || null);
      setLoyalty(loyaltyData);
      setRecommendations(recommendationsData.slice(0, 3)); // Top 3 recommendations
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 pb-12">
        <div className="mb-4">
          <p className="text-sm opacity-90">{greeting()}</p>
          <h1 className="text-2xl font-bold">
            {customer?.firstName} {customer?.lastName}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 space-y-6">
        {/* Next Booking */}
        <NextBookingCard booking={nextBooking} loading={loading} />

        {/* Loyalty Summary */}
        <LoyaltySummaryCard loyalty={loyalty} loading={loading} />

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              Gợi ý cho bạn
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {rec.serviceName}
                  </div>
                  <div className="text-sm text-gray-600">{rec.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <QuickActionsGrid />
      </div>
    </div>
  );
}

