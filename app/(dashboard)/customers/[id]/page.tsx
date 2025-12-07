"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import CustomerTimeline from "./timeline";

interface CustomerTag {
  id: string;
  tag: string;
  category: string | null;
}

export default function CustomerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [insight, setInsight] = useState<any>(null);
  const [customerInsight, setCustomerInsight] = useState<any>(null);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingCustomerInsight, setLoadingCustomerInsight] = useState(false);

  useEffect(() => {
    loadCustomer();
    loadTags();
  }, [params.id]);

  const loadTags = async () => {
    try {
      const res = await fetch("/api/crm/tags/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: params.id }),
      });
      const data = await res.json();
      if (data.success) {
        setTags(data.tags || []);
      }
    } catch (err) {
      console.error("Load tags error:", err);
    }
  };

  const refreshTags = async () => {
    setLoadingTags(true);
    try {
      const res = await fetch("/api/crm/tags/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: params.id }),
      });
      const data = await res.json();
      if (data.success) {
        setTags(data.tags || []);
        alert(`Đã refresh ${data.total} tags! Segment: ${data.segment}`);
      }
    } catch (err) {
      console.error("Refresh tags error:", err);
      alert("Có lỗi xảy ra khi refresh tags");
    } finally {
      setLoadingTags(false);
    }
  };

  const loadInsight = async () => {
    try {
      const res = await fetch("/api/crm/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: params.id }),
      });
      const data = await res.json();
      if (data.success) {
        setInsight(data.insight);
      }
    } catch (err) {
      console.error("Load insight error:", err);
    }
  };

  const loadCustomerInsight = async () => {
    setLoadingCustomerInsight(true);
    try {
      const res = await fetch("/api/crm/insight/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: params.id }),
      });
      const data = await res.json();
      if (data.success && data.insight) {
        setCustomerInsight(data.insight);
      }
    } catch (err) {
      console.error("Load customer insight error:", err);
    } finally {
      setLoadingCustomerInsight(false);
    }
  };

  const generateCustomerInsight = async () => {
    setLoadingCustomerInsight(true);
    try {
      const res = await fetch("/api/crm/insight/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: params.id, forceRefresh: true }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomerInsight(data.insight);
        alert("Đã tạo AI Insight thành công!");
      } else {
        alert("Có lỗi xảy ra: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Generate customer insight error:", err);
      alert("Có lỗi xảy ra khi tạo insight");
    } finally {
      setLoadingCustomerInsight(false);
    }
  };

  useEffect(() => {
    loadCustomerInsight();
  }, [params.id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id }),
      });

      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        setFormData(data.customer);
      }
    } catch (err) {
      console.error("Load customer error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/customers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id,
          data: formData,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setCustomer(result.customer);
        setEditing(false);
        alert("Đã cập nhật thành công!");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Có lỗi xảy ra khi cập nhật");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12 text-red-600">
          Không tìm thấy khách hàng
        </div>
      </div>
    );
  }

  const riskLevelColors: Record<string, string> = {
    LOW: "bg-green-100 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    HIGH: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">👤 Hồ sơ Khách hàng</h1>
        <Button onClick={() => setEditing(!editing)}>
          {editing ? "Hủy" : "✏️ Chỉnh sửa"}
        </Button>
      </div>

      {/* Customer Profile Card */}
      <Card className="p-6 border rounded-xl space-y-4">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          {customer.avatar && (
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-24 h-24 rounded-full object-cover border-2"
            />
          )}

          <div className="flex-1 space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Tên khách hàng
              </label>
              {editing ? (
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">
                  {customer.name}
                </h2>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                📱 Số điện thoại
              </label>
              {editing ? (
                <Input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1"
                />
              ) : (
                <div className="text-lg text-gray-700">{customer.phone}</div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">💳 Tổng chi tiêu</div>
                <div className="text-xl font-bold text-blue-700">
                  {customer.totalSpent?.toLocaleString("vi-VN") || 0}₫
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-gray-600 mb-1">🗓 Tổng số lần đến</div>
                <div className="text-xl font-bold text-green-700">
                  {customer.totalVisits || 0}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-gray-600 mb-1">
                  🎨 Stylist yêu thích
                </div>
                <div className="text-lg font-semibold text-purple-700">
                  {customer.preferredStylist || "Chưa có"}
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-sm text-gray-600 mb-1">⚠️ Mức rủi ro</div>
                {customer.riskLevel ? (
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium border w-fit mt-1 ${
                      riskLevelColors[customer.riskLevel] || "bg-gray-100"
                    }`}
                  >
                    {customer.riskLevel}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Chưa đánh giá</div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Giới tính
                </label>
                <div className="text-gray-700">
                  {customer.gender || "Chưa có"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Sinh nhật
                </label>
                <div className="text-gray-700">
                  {customer.birthday
                    ? new Date(customer.birthday).toLocaleDateString("vi-VN")
                    : "Chưa có"}
                </div>
              </div>
            </div>

            {/* Notes */}
            {customer.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Ghi chú
                </label>
                {editing ? (
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                ) : (
                  <div className="text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg border">
                    {customer.notes}
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            {editing && (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-blue-600">
                  💾 Lưu thay đổi
                </Button>
                <Button
                  onClick={() => {
                    setFormData(customer);
                    setEditing(false);
                  }}
                  variant="outline"
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tags */}
      <Card className="p-6 border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">🏷️ CRM Tags & Segmentation</h2>
          <div className="flex gap-2">
            <Button onClick={refreshTags} disabled={loadingTags} variant="outline">
              {loadingTags ? "⏳ Đang xử lý..." : "🔄 Refresh Tags"}
            </Button>
            <Button onClick={loadInsight} variant="outline">
              🤖 AI Insight
            </Button>
          </div>
        </div>

        {tags.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Chưa có tags. Click "Refresh Tags" để tự động generate.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Grouped Tags */}
            {["behavior", "frequency", "technical", "service", "complaint", "stylist"].map((category) => {
              const categoryTags = tags.filter((t) => t.category === category);
              if (categoryTags.length === 0) return null;

              const categoryNames: Record<string, string> = {
                behavior: "Hành vi",
                frequency: "Tần suất",
                technical: "Kỹ thuật",
                service: "Dịch vụ",
                complaint: "Phàn nàn",
                stylist: "Stylist",
              };

              return (
                <div key={category}>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {categoryNames[category] || category}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryTags.map((t) => {
                      const tagColors: Record<string, string> = {
                        VIP: "bg-purple-100 text-purple-700 border-purple-200",
                        "High Value": "bg-blue-100 text-blue-700 border-blue-200",
                        "Low Value": "bg-gray-100 text-gray-700 border-gray-200",
                        Active: "bg-green-100 text-green-700 border-green-200",
                        Warm: "bg-yellow-100 text-yellow-700 border-yellow-200",
                        Cold: "bg-orange-100 text-orange-700 border-orange-200",
                        Overdue: "bg-red-100 text-red-700 border-red-200",
                        Lost: "bg-gray-200 text-gray-800 border-gray-300",
                        "Risky Hair": "bg-red-100 text-red-700 border-red-200",
                        "Bleached Hair": "bg-pink-100 text-pink-700 border-pink-200",
                      };

                      return (
                        <span
                          key={t.id}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            tagColors[t.tag] ||
                            "bg-indigo-100 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {t.tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Other tags */}
            {tags.filter((t) => !t.category || !["behavior", "frequency", "technical", "service", "complaint", "stylist"].includes(t.category)).length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Khác:
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags
                    .filter((t) => !t.category || !["behavior", "frequency", "technical", "service", "complaint", "stylist"].includes(t.category))
                    .map((t) => (
                      <span
                        key={t.id}
                        className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200"
                      >
                        {t.tag}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Insight */}
        {insight && (
          <Card className="mt-4 p-4 border bg-blue-50">
            <h3 className="font-semibold text-blue-700 mb-3">
              🤖 AI Insight & Gợi ý
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium mb-1">Phân tích:</div>
                <div className="text-gray-700">{insight.insight}</div>
              </div>
              {insight.idealServiceForNextVisit && (
                <div>
                  <div className="font-medium mb-1">
                    💡 Dịch vụ gợi ý cho lần tới:
                  </div>
                  <div className="text-gray-700">
                    {insight.idealServiceForNextVisit}
                  </div>
                </div>
              )}
              {insight.nextBestAction && (
                <div>
                  <div className="font-medium mb-1">🎯 Hành động tốt nhất:</div>
                  <div className="text-gray-700">{insight.nextBestAction}</div>
                </div>
              )}
              {insight.personalizedCare && (
                <div>
                  <div className="font-medium mb-1">
                    ❤️ Chăm sóc cá nhân hóa:
                  </div>
                  <div className="text-gray-700">{insight.personalizedCare}</div>
                </div>
              )}
            </div>
          </Card>
        )}
      </Card>

      {/* AI Customer Insight (Phase 17F) */}
      <Card className="p-6 border rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-purple-900">
            🧠 AI Customer Insight (Phase 17F)
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={loadCustomerInsight}
              disabled={loadingCustomerInsight}
              variant="outline"
            >
              🔄 Refresh
            </Button>
            <Button
              onClick={generateCustomerInsight}
              disabled={loadingCustomerInsight}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loadingCustomerInsight ? "⏳ Đang phân tích..." : "🤖 Tạo Insight"}
            </Button>
          </div>
        </div>

        {loadingCustomerInsight && !customerInsight ? (
          <div className="text-center py-8 text-gray-500">
            ⏳ Đang phân tích AI...
          </div>
        ) : customerInsight ? (
          <div className="space-y-6">
            {/* Churn Risk */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-900">
                  ⚠️ Nguy cơ mất khách:
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    customerInsight.churnRisk === "HIGH"
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : customerInsight.churnRisk === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : "bg-green-100 text-green-700 border border-green-300"
                  }`}
                >
                  {customerInsight.churnRisk}
                </div>
              </div>
            </div>

            {/* Revisit Window */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-gray-900 mb-2">
                📅 Dự đoán quay lại:
              </div>
              <div className="text-lg text-blue-700 font-medium">
                {customerInsight.revisitWindow}
              </div>
            </div>

            {/* Next Service */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-gray-900 mb-2">
                💡 Dịch vụ phù hợp tiếp theo:
              </div>
              <div className="text-lg text-green-700 font-medium">
                {customerInsight.nextService}
              </div>
            </div>

            {/* Promotion */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-gray-900 mb-2">
                🎁 Ưu đãi phù hợp:
              </div>
              <div className="text-lg text-purple-700 font-medium">
                {customerInsight.promotion}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-gray-900 mb-3">
                📊 Tóm tắt khách hàng:
              </div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {customerInsight.summary}
              </div>
            </div>

            {/* Action Steps */}
            {customerInsight.actionSteps &&
              Array.isArray(customerInsight.actionSteps) &&
              customerInsight.actionSteps.length > 0 && (
                <div className="p-4 bg-white rounded-lg border">
                  <div className="font-semibold text-gray-900 mb-3">
                    ✅ Next Best Actions:
                  </div>
                  <ul className="space-y-2">
                    {customerInsight.actionSteps.map((step: any, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-blue-600 mt-1">•</span>
                        <div className="flex-1">
                          <div className="text-gray-700">{step.action || step}</div>
                          {step.priority && (
                            <div className="mt-1">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  step.priority === "HIGH"
                                    ? "bg-red-100 text-red-700"
                                    : step.priority === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {step.priority} Priority
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Predictions */}
            {customerInsight.predictions && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="font-semibold text-gray-900 mb-3">
                  🔮 AI Predictions:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {customerInsight.predictions.ltv && (
                    <div>
                      <div className="text-gray-600 mb-1">💰 Lifetime Value:</div>
                      <div className="font-medium text-gray-900">
                        {customerInsight.predictions.ltv}
                      </div>
                    </div>
                  )}
                  {customerInsight.predictions.nextPurchase && (
                    <div>
                      <div className="text-gray-600 mb-1">🛒 Next Purchase:</div>
                      <div className="font-medium text-gray-900">
                        {customerInsight.predictions.nextPurchase}
                      </div>
                    </div>
                  )}
                  {customerInsight.predictions.serviceInterest && (
                    <div>
                      <div className="text-gray-600 mb-1">📈 Service Interest:</div>
                      <div className="font-medium text-gray-900">
                        {customerInsight.predictions.serviceInterest}
                      </div>
                    </div>
                  )}
                  {customerInsight.predictions.productUpsell && (
                    <div>
                      <div className="text-gray-600 mb-1">✨ Product Upsell:</div>
                      <div className="font-medium text-gray-900">
                        {customerInsight.predictions.productUpsell}
                      </div>
                    </div>
                  )}
                  {customerInsight.predictions.bestContactTime && (
                    <div>
                      <div className="text-gray-600 mb-1">⏰ Best Contact Time:</div>
                      <div className="font-medium text-gray-900">
                        {customerInsight.predictions.bestContactTime}
                      </div>
                    </div>
                  )}
                  {customerInsight.predictions.emotionalState && (
                    <div>
                      <div className="text-gray-600 mb-1">❤️ Emotional State:</div>
                      <div className="font-medium text-gray-900">
                        {customerInsight.predictions.emotionalState}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-xs text-gray-500 text-right">
              Cập nhật: {new Date(customerInsight.updatedAt).toLocaleString("vi-VN")}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Chưa có AI Insight. Click "🤖 Tạo Insight" để AI phân tích khách hàng.
          </div>
        )}
      </Card>

      {/* Timeline */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📅 Timeline Dịch vụ</h2>
        <CustomerTimeline customerId={params.id} />
      </div>
    </div>
  );
}

