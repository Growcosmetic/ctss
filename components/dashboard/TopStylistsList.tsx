"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Star } from "lucide-react";

interface StylistData {
  id: string;
  name: string;
  avatar?: string;
  revenue: number;
  upsellRate: number;
  rating: number;
  trend: number;
}

interface TopStylistsListProps {
  data: StylistData[];
}

export default function TopStylistsList({ data }: TopStylistsListProps) {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Top Stylists</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {data.length > 0 ? (
          data.map((stylist) => (
            <div
              key={stylist.id}
              className="p-4 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {stylist.avatar ? (
                    <img
                      src={stylist.avatar}
                      alt={stylist.name}
                      className="w-12 h-12 rounded-full object-cover"
                      style={{ width: "48px", height: "48px" }}
                    />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center text-white font-semibold"
                      style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: "#A4E3E3",
                        color: "#0c4a6e",
                      }}
                    >
                      <span className="text-lg">{stylist.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{stylist.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {renderStars(stylist.rating)}
                      <span className="text-xs text-gray-500 ml-1">
                        {stylist.rating.toFixed(1)}
                      </span>
                    </div>
                    {/* Upsell Rate */}
                    <span className="text-xs text-gray-500">
                      Upsell: {stylist.upsellRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Revenue & Trend */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(stylist.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stylist.trend)}
                    <span
                      className={`text-sm font-medium ${
                        stylist.trend > 0
                          ? "text-green-600"
                          : stylist.trend < 0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {Math.abs(stylist.trend).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">Chưa có dữ liệu</div>
        )}
      </div>
    </div>
  );
}
