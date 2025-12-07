// ============================================
// Customer360 Layout Component
// ============================================

"use client";

import React from "react";
import { CustomerHeaderCard } from "./CustomerHeaderCard";
import type {
  Customer360Payload,
  CustomerAIInsights,
  CustomerNBAAction,
} from "../types";

// Import child components
import { InsightPersonaCard } from "./InsightPersonaCard";
import { InsightPredictionCard } from "./InsightPredictionCard";
import { InsightRiskCard } from "./InsightRiskCard";
import { NextBestActionCard } from "./NextBestActionCard";
import { CustomerBookingTimeline } from "./CustomerBookingTimeline";
import { CustomerInvoiceList } from "./CustomerInvoiceList";
import { CustomerProductList } from "./CustomerProductList";
import { CustomerLoyaltyPanel } from "./CustomerLoyaltyPanel";
import { CustomerNotesCard } from "./CustomerNotesCard";
import { CustomerHistoryCharts } from "./CustomerHistoryCharts";
import { Loading360Skeleton } from "./Loading360Skeleton";
import { CustomerJourneyCard } from "./CustomerJourneyCard";

interface Customer360LayoutProps {
  data: {
    customer360: Omit<Customer360Payload, "insights" | "nba">;
    insights: CustomerAIInsights;
    nba: CustomerNBAAction;
  } | null;
  loading?: boolean;
  error?: string | null;
}

export function Customer360Layout({
  data,
  loading,
  error,
}: Customer360LayoutProps) {
  if (loading) {
    return <Loading360Skeleton />;
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">Lỗi khi tải dữ liệu</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <p className="text-gray-500">Không có dữ liệu khách hàng</p>
        </div>
      </div>
    );
  }

  const { customer360, insights, nba } = data;

  return (
    <div className="w-full p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen animate-fadeIn">
      {/* HEADER */}
      <div className="animate-fadeIn">
        <CustomerHeaderCard core={customer360?.core} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* LEFT COLUMN — HISTORY */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="animate-slideUp" style={{ animationDelay: "0.1s" }}>
            {customer360?.loyalty && (
              <CustomerLoyaltyPanel loyalty={customer360.loyalty} />
            )}
          </div>
          <div className="animate-slideUp" style={{ animationDelay: "0.2s" }}>
            {customer360?.visitFrequency && customer360?.invoiceHistory && (
              <CustomerHistoryCharts
                visitFrequency={customer360.visitFrequency}
                invoiceHistory={customer360.invoiceHistory}
              />
            )}
          </div>
          <div className="animate-slideUp" style={{ animationDelay: "0.3s" }}>
            {customer360?.bookingHistory && (
              <CustomerBookingTimeline bookings={customer360.bookingHistory} />
            )}
          </div>
          <div className="animate-slideUp" style={{ animationDelay: "0.4s" }}>
            {customer360?.invoiceHistory && (
              <CustomerInvoiceList invoices={customer360.invoiceHistory} />
            )}
          </div>
          <div className="animate-slideUp" style={{ animationDelay: "0.5s" }}>
            {customer360?.productHistory && (
              <CustomerProductList products={customer360.productHistory} />
            )}
          </div>
          {customer360?.crmNotes && customer360.crmNotes.length > 0 && (
            <div className="animate-slideUp" style={{ animationDelay: "0.6s" }}>
              <CustomerNotesCard notes={customer360.crmNotes} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — AI INSIGHTS */}
        <div className="space-y-4 md:space-y-6">
          <div className="animate-slideUp" style={{ animationDelay: "0.1s" }}>
            {customer360?.core?.journeyState && (
              <CustomerJourneyCard journeyState={customer360.core.journeyState} />
            )}
          </div>
          <div className="animate-slideUp" style={{ animationDelay: "0.2s" }}>
            {insights?.persona && (
              <InsightPersonaCard persona={insights.persona} />
            )}
          </div>
          <div className="animate-slideUp" style={{ animationDelay: "0.3s" }}>
            {insights && <InsightPredictionCard insights={insights} />}
          </div>
          <div className="animate-slideUp" style={{ animationDelay: "0.4s" }}>
            {insights?.churnRisk && (
              <InsightRiskCard
                risk={insights.churnRisk}
                cluster={insights?.cluster}
              />
            )}
          </div>
          <div className="animate-slideUp" style={{ animationDelay: "0.5s" }}>
            {nba && <NextBestActionCard nba={nba} />}
          </div>
        </div>
      </div>
    </div>
  );
}

