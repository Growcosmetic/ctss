"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/features/customer-app/hooks/useCustomerAuth";
import { getCustomerPromotions } from "@/features/customer-app/services/customerApi";
import CustomerNavBar from "@/features/customer-app/components/CustomerNavBar";
import { Promotion } from "@/features/customer-app/types";
import { Gift, Sparkles, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function CustomerPromotionsPage() {
  const { authenticated, loading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push("/customer-app/login");
      return;
    }

    if (authenticated) {
      loadPromotions();
    }
  }, [authenticated, authLoading]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await getCustomerPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Error loading promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case "TIER_BASED":
        return <Sparkles className="w-5 h-5" />;
      case "BIRTHDAY":
        return <Gift className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getPromotionColor = (type: string) => {
    switch (type) {
      case "TIER_BASED":
        return "from-purple-500 to-indigo-500";
      case "BIRTHDAY":
        return "from-pink-500 to-rose-500";
      case "PERSONALIZED":
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
          <h1 className="text-2xl font-bold">Ưu đãi dành cho bạn</h1>
        </div>

        {/* Promotions */}
        <div className="p-4 space-y-4">
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Hiện chưa có ưu đãi nào
              </p>
            </div>
          ) : (
            promotions.map((promo) => (
              <div
                key={promo.id}
                className={`bg-gradient-to-br ${getPromotionColor(promo.type)} text-white rounded-xl p-6 shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getPromotionIcon(promo.type)}
                    <h3 className="font-bold text-lg">{promo.title}</h3>
                  </div>
                </div>

                <p className="text-white/90 mb-4">{promo.description}</p>

                {promo.discountPercent && (
                  <div className="text-3xl font-bold mb-2">
                    Giảm {promo.discountPercent}%
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-white/80 mt-4 pt-4 border-t border-white/20">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Có hiệu lực đến{" "}
                    {format(new Date(promo.validTo), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <CustomerNavBar />
    </>
  );
}

