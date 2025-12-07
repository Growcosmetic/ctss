"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/features/customer-app/hooks/useCustomerAuth";
import { getMinaRecommendations } from "@/features/customer-app/services/customerApi";
import CustomerNavBar from "@/features/customer-app/components/CustomerNavBar";
import { MinaRecommendation } from "@/features/customer-app/types";
import { Sparkles, Loader2, TrendingUp } from "lucide-react";

export default function CustomerRecommendationsPage() {
  const { authenticated, loading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<MinaRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push("/customer-app/login");
      return;
    }

    if (authenticated) {
      loadRecommendations();
    }
  }, [authenticated, authLoading]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await getMinaRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "from-red-500 to-pink-500";
      case "MEDIUM":
        return "from-yellow-500 to-orange-500";
      case "LOW":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-gray-500 to-gray-600";
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
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Gợi ý từ Mina AI</h1>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-4 space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Chưa có gợi ý nào cho bạn
              </p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${getPriorityColor(rec.priority)} text-white rounded-xl p-6 shadow-lg`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg">{rec.serviceName}</h3>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {rec.priority}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-white/90">{rec.reason}</p>
                </div>
                <button
                  onClick={() => router.push(`/customer-app/book?serviceId=${rec.serviceId}`)}
                  className="mt-4 w-full bg-white text-pink-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Đặt lịch ngay
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <CustomerNavBar />
    </>
  );
}

