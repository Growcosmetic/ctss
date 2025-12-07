"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Projection {
  id: string;
  product: {
    id: string;
    name: string;
    unit: string;
    category: string;
    stock: number;
  };
  currentStock: number;
  safetyStock: number | null;
  averageDailyUsage: number;
  projection7Days: number;
  projection14Days: number;
  projection30Days: number;
  daysUntilEmpty: number | null;
  needsRestock: boolean;
  restockPriority: string | null;
}

interface Recommendation {
  id: string;
  product: {
    id: string;
    name: string;
    unit: string;
    category: string;
  };
  currentStock: number;
  recommendedQty: number;
  recommendedUnit: string | null;
  estimatedCost: number | null;
  priority: string;
  reason: string | null;
  budgetCategory: string | null;
  canDefer: boolean;
  status: string;
}

interface Trigger {
  id: string;
  product: {
    id: string;
    name: string;
    unit: string;
  };
  triggerType: string;
  severity: string;
  message: string | null;
  createdAt: string;
}

export default function RestockPage() {
  const [projections, setProjections] = useState<Projection[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load projections
      const projRes = await fetch("/api/inventory/projection/calculate?needsRestock=true");
      const projData = await projRes.json();
      if (projData.success) {
        setProjections(projData.projections || []);
      }

      // Load recommendations
      const recRes = await fetch("/api/inventory/restock/recommend?status=PENDING");
      const recData = await recRes.json();
      if (recData.success) {
        setRecommendations(recData.recommendations || []);
      }

      // Load triggers
      const trigRes = await fetch("/api/inventory/restock/trigger");
      const trigData = await trigRes.json();
      if (trigData.success) {
        setTriggers(trigData.triggers || []);
      }
    } catch (err) {
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/inventory/restock/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: budget ? parseFloat(budget.replace(/,/g, "")) : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
        alert(
          `Đã tạo ${data.recommendations?.length || 0} đề xuất nhập hàng.\nTổng chi phí: ${data.totalCost?.toLocaleString("vi-VN") || 0}đ`
        );
      }
    } catch (err) {
      console.error("Generate recommendations error:", err);
      alert("Có lỗi xảy ra");
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-300";
      case "MEDIUM":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "LOW":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-300";
      case "WARNING":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "INFO":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const runningLow = projections.filter((p) => p.needsRestock);
  const excessStock = projections.filter(
    (p) => !p.needsRestock && (p.daysUntilEmpty || 0) > 60
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            📦 Inventory Projection & Auto Restock
          </h1>
          <p className="text-gray-600">
            Hệ thống dự đoán tồn kho và đề xuất nhập hàng tự động
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {/* Generate Recommendations */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">
          🤖 Tạo đề xuất nhập hàng (AI)
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngân sách tối đa (đ) - Tùy chọn
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value.replace(/[^0-9,]/g, ""))
              }
              placeholder="6,000,000"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="pt-6">
            <Button
              onClick={generateRecommendations}
              disabled={generating}
              className="bg-blue-600"
            >
              {generating ? "⏳ Đang tạo..." : "✨ Tạo đề xuất"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Triggers */}
      {triggers.length > 0 && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">
            🔔 Cảnh báo tự động ({triggers.length})
          </h2>
          <div className="space-y-3">
            {triggers.slice(0, 5).map((trigger) => (
              <div
                key={trigger.id}
                className={`p-4 border rounded-lg ${getSeverityColor(
                  trigger.severity
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{trigger.product.name}</div>
                    <div className="text-sm mt-1">{trigger.message}</div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(trigger.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Running Low Products */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">
          ⚠️ Sản phẩm sắp hết ({runningLow.length})
        </h2>
        {runningLow.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tất cả sản phẩm đều đủ tồn kho
          </div>
        ) : (
          <div className="space-y-3">
            {runningLow.map((projection) => (
              <div
                key={projection.id}
                className="p-4 border rounded-lg bg-red-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">
                      {projection.product.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Tồn kho: {projection.currentStock}
                      {projection.product.unit} | Dự báo hết trong:{" "}
                      {projection.daysUntilEmpty
                        ? Math.round(projection.daysUntilEmpty)
                        : "N/A"}{" "}
                      ngày
                    </div>
                    <div className="text-sm text-gray-600">
                      Trung bình/ngày: {projection.averageDailyUsage.toFixed(1)}
                      {projection.product.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(
                        projection.restockPriority || "LOW"
                      )}`}
                    >
                      {projection.restockPriority || "LOW"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">
            📋 Đề xuất nhập hàng ({recommendations.length})
          </h2>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 border rounded-lg bg-blue-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">
                      {rec.product.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {rec.reason}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(
                      rec.priority
                    )}`}
                  >
                    {rec.priority}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                  <div>
                    <div className="text-xs text-gray-600">Tồn kho hiện tại</div>
                    <div className="font-semibold">
                      {rec.currentStock} {rec.product.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Đề xuất nhập</div>
                    <div className="font-semibold">
                      {rec.recommendedQty.toFixed(1)} {rec.recommendedUnit || rec.product.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Chi phí ước tính</div>
                    <div className="font-semibold text-green-600">
                      {rec.estimatedCost?.toLocaleString("vi-VN") || "N/A"}đ
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Phân loại</div>
                    <div className="font-semibold">{rec.budgetCategory || "N/A"}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Tổng chi phí đề xuất:</span>
                <span className="text-2xl font-bold text-green-600">
                  {recommendations
                    .reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
                    .toLocaleString("vi-VN")}
                  đ
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Excess Stock */}
      {excessStock.length > 0 && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">
            📊 Sản phẩm tồn kho dư ({excessStock.length})
          </h2>
          <div className="space-y-3">
            {excessStock.map((projection) => (
              <div
                key={projection.id}
                className="p-4 border rounded-lg bg-green-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {projection.product.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Tồn kho: {projection.currentStock}
                      {projection.product.unit} | Đủ dùng trong:{" "}
                      {projection.daysUntilEmpty
                        ? Math.round(projection.daysUntilEmpty)
                        : "N/A"}{" "}
                      ngày
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

