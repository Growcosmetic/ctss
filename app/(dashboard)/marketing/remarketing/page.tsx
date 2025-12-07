"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSegmentInfo } from "@/core/remarketing/segmentCustomers";
import type { CustomerSegment } from "@/core/remarketing/segmentCustomers";

export default function RemarketingPage() {
  const [segment, setSegment] = useState<CustomerSegment>("all");
  const [goal, setGoal] = useState("");
  const [platform, setPlatform] = useState("");
  const [style, setStyle] = useState("");

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);

  const run = async () => {
    if (!segment || !goal || !platform || !style) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/marketing/remarketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment, goal, platform, style }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate remarketing");
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
        <h1 className="text-3xl font-bold mb-2">🎯 AI Remarketing Engine</h1>
        <p className="text-gray-600">
          Tạo nội dung remarketing cá nhân hóa cho từng nhóm khách hàng
        </p>
      </div>

      <Card className="p-6 border space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Chọn nhóm khách hàng *
          </label>
          <Select
            value={segment}
            onChange={(e) => setSegment(e.target.value as CustomerSegment)}
          >
            <option value="recent_uon">Khách mới uốn (30 ngày)</option>
            <option value="recent_nhuom">Khách mới nhuộm (30 ngày)</option>
            <option value="not_return_60">
              Khách 60 ngày chưa quay lại
            </option>
            <option value="vip">Khách VIP</option>
            <option value="high_risk">Khách rủi ro cao</option>
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
            placeholder="Ví dụ: Kéo khách quay lại, upsell sản phẩm, chúc mừng dịp đặc biệt..."
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
            <option value="sms">SMS</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Phong cách *
          </label>
          <Select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="">Chọn phong cách</option>
            <option value="friendly">Thân thiện</option>
            <option value="luxury">Sang trọng</option>
            <option value="professional">Chuyên nghiệp</option>
          </Select>
        </div>

        <Button
          onClick={run}
          disabled={loading}
          className="w-full py-3 text-base"
        >
          {loading
            ? `⏳ Đang tạo nội dung cho ${totalCustomers || "..."} khách...`
            : "🎯 Tạo nội dung remarketing"}
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
            ✅ Đã tạo nội dung cho <strong>{totalCustomers}</strong> khách hàng
            trong nhóm <strong>{segmentInfo.label}</strong>
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="p-6 border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">📨 Kết quả Remarketing</h2>
            <div className="text-sm text-gray-500">
              {results.length} messages
            </div>
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
                  {r.priority && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        r.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : r.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {r.priority}
                    </span>
                  )}
                </div>

                {r.error ? (
                  <div className="text-red-600 text-sm">
                    ❌ Lỗi: {r.error}
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        📝 Message:
                      </div>
                      <div className="text-gray-900 bg-white p-3 rounded border border-gray-200">
                        {r.message}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(r.message)}
                        className="mt-1 text-xs"
                      >
                        Copy
                      </Button>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        🎯 CTA:
                      </div>
                      <div className="text-indigo-700 font-medium">
                        {r.cta}
                      </div>
                    </div>

                    {r.reason && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          💡 Lý do:
                        </div>
                        <div className="text-xs text-gray-500 italic">
                          {r.reason}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
                      Segment: {r.segment}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

