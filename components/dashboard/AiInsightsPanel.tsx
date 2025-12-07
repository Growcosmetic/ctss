"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Info } from "lucide-react";

interface Insight {
  type: "success" | "warning" | "tip" | "info";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
}

export default function AiInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      // Mock insights for now - can be replaced with actual API call
      setTimeout(() => {
        setInsights([
          {
            type: "tip",
            title: "Tăng doanh thu",
            message: "Khách hàng thường mua thêm dịch vụ vào thứ 6. Hãy đề xuất upsell vào thời điểm này.",
            priority: "high",
          },
          {
            type: "success",
            title: "Hiệu suất tốt",
            message: "Dịch vụ cắt tóc đang có doanh thu cao nhất. Cân nhắc mở rộng thời gian phục vụ.",
            priority: "medium",
          },
          {
            type: "info",
            title: "Dự báo",
            message: "Tuần tới có khả năng tăng 15% số lượng booking. Chuẩn bị nhân lực sẵn sàng.",
            priority: "low",
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
      setLoading(false);
    }
  };

  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return <TrendingUp className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "tip":
        return <Lightbulb className="w-4 h-4" />;
      case "info":
        return <Info className="w-4 h-4" />;
    }
  };

  const getColor = (type: Insight["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "tip":
        return "bg-blue-100 text-blue-700";
      case "info":
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Đang tải...</div>
      ) : insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getColor(insight.type)} flex-shrink-0`}>
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {insight.message}
                  </p>
                  {insight.priority === "high" && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                      Quan trọng
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          Chưa có insight nào
        </div>
      )}
    </div>
  );
}
