"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSegmentInfo } from "@/core/remarketing/segmentCustomers";
import type { CustomerSegment } from "@/core/remarketing/segmentCustomers";

export default function CTAOptimizerPage() {
  const [segment, setSegment] = useState<CustomerSegment>("all");
  const [goal, setGoal] = useState("");
  const [platform, setPlatform] = useState("");
  const [contentType, setContentType] = useState("");

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);

  const run = async () => {
    if (!segment || !goal || !platform) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/marketing/cta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segment,
          goal,
          platform,
          contentType: contentType || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to optimize CTAs");
      }

      setResults(data.results || []);
      setTotalCustomers(data.totalCustomers || 0);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã copy!");
  };

  const segmentInfo = getSegmentInfo(segment);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">⚡ CTA Optimizer</h1>
        <p className="text-gray-600">
          Tối ưu CTA tự động theo hành vi khách, segment, và mục tiêu chiến dịch
        </p>
      </div>

      <Card className="p-6 border space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nhóm khách hàng *
          </label>
          <Select
            value={segment}
            onChange={(e) => setSegment(e.target.value as CustomerSegment)}
          >
            <option value="recent_uon">Khách uốn mới (30 ngày)</option>
            <option value="recent_nhuom">Khách nhuộm mới (30 ngày)</option>
            <option value="not_return_60">60 ngày chưa quay lại</option>
            <option value="vip">Khách VIP</option>
            <option value="high_risk">Khách rủi ro</option>
            <option value="all">Tất cả khách hàng</option>
          </Select>
          {segmentInfo && (
            <p className="text-xs text-gray-500 mt-1">
              {segmentInfo.description}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Mục tiêu chiến dịch *
          </label>
          <Input
            placeholder="Ví dụ: Đặt lịch tuần này, tăng tương tác, follow-up care..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Platform *
          </label>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">Chọn platform</option>
            <option value="zalo">Zalo</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="sms">SMS</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Loại nội dung (tùy chọn)
          </label>
          <Select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="post">Post</option>
            <option value="reels">Reels</option>
            <option value="remarketing">Remarketing</option>
            <option value="followup">Follow-up</option>
          </Select>
        </div>

        <Button
          onClick={run}
          disabled={loading}
          className="w-full py-3 text-base"
        >
          {loading
            ? `⏳ Đang tối ưu CTA cho ${totalCustomers || "..."} khách...`
            : "⚡ Tối ưu CTA"}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </Card>

      {totalCustomers > 0 && !loading && (
        <Card className="p-4 border bg-blue-50">
          <div className="text-sm text-blue-700">
            ✅ Đã tối ưu CTA cho <strong>{totalCustomers}</strong> khách hàng trong
            nhóm <strong>{segmentInfo.label}</strong>
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="p-6 border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">📨 Kết quả CTA Optimization</h2>
            <div className="text-sm text-gray-500">{results.length} CTAs</div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {r.name || "Khách hàng"}
                    </div>
                    <div className="text-sm text-gray-500">{r.phone}</div>
                  </div>
                  {r.aiCTA?.priority && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        r.aiCTA.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : r.aiCTA.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {r.aiCTA.priority}
                    </span>
                  )}
                </div>

                {r.error ? (
                  <div className="text-red-600 text-sm">❌ Lỗi: {r.error}</div>
                ) : (
                  <div className="space-y-3">
                    {/* Recommended CTA (Best) */}
                    {r.recommended && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-xs font-semibold text-green-700 mb-1 flex items-center justify-between">
                          <span>⭐ CTA ĐỀ XUẤT (Tốt nhất):</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(r.recommended)}
                            className="text-xs h-6"
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="text-green-900 font-bold text-lg">
                          {r.recommended}
                        </div>
                      </div>
                    )}

                    {/* AI CTA */}
                    {r.aiCTA?.cta && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="text-xs font-semibold text-indigo-700 mb-1 flex items-center justify-between">
                          <span>🤖 AI CTA:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(r.aiCTA.cta)}
                            className="text-xs h-6"
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="text-indigo-900 font-medium">
                          {r.aiCTA.cta}
                        </div>
                        {r.aiCTA.explanation && (
                          <div className="text-xs text-indigo-600 mt-2 italic">
                            💡 {r.aiCTA.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rule CTA */}
                    {r.ruleCTA && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                          <span>📋 Rule-based CTA:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(r.ruleCTA)}
                            className="text-xs h-6"
                          >
                            Copy
                          </Button>
                        </div>
                        <div className="text-gray-800">{r.ruleCTA}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

