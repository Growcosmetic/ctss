"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function MarketingContentPage() {
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [platform, setPlatform] = useState("");
  const [style, setStyle] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!topic || !goal || !platform || !style) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/marketing/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          goal,
          platform,
          style,
          additionalContext: additionalContext || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate content");
      }

      setResult(data);
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

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">✨ AI Marketing Content Generator</h1>
        <p className="text-gray-600">
          Tạo nội dung marketing chuyên nghiệp cho Facebook, Instagram, TikTok
        </p>
      </div>

      <Card className="p-6 space-y-4 border">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Chủ đề *
          </label>
          <Input
            placeholder="Ví dụ: Uốn sóng Hàn, nhuộm nâu lạnh, tóc layer..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Mục tiêu *
          </label>
          <Input
            placeholder="Ví dụ: Đặt lịch tuần này, tăng nhận diện, thúc đẩy tương tác..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Platform *
          </label>
          <Select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="">Chọn platform</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Phong cách nội dung *
          </label>
          <Select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="">Chọn phong cách</option>
            <option value="friendly">Thân thiện</option>
            <option value="luxury">Sang trọng</option>
            <option value="energetic">Tươi trẻ</option>
            <option value="professional">Chuyên nghiệp</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Context thêm (tùy chọn)
          </label>
          <Textarea
            placeholder="Thông tin bổ sung, yêu cầu đặc biệt..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={generate}
          disabled={loading}
          className="w-full py-3 text-base"
        >
          {loading ? "⏳ Đang tạo nội dung..." : "✨ Tạo nội dung marketing"}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <Card className="p-6 space-y-6 border bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">🔮 Kết quả</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const fullContent = `${result.headline}\n\n${result.content}\n\n${result.hashtags}\n\n${result.cta}`;
                copyToClipboard(fullContent);
              }}
            >
              📋 Copy tất cả
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-purple-700">
                  📌 Tiêu đề:
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.headline)}
                >
                  Copy
                </Button>
              </div>
              <div className="text-gray-900 font-medium">{result.headline}</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-purple-700">
                  ✍️ Nội dung:
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.content)}
                >
                  Copy
                </Button>
              </div>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {result.content}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-purple-700">
                  # Hashtags:
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.hashtags)}
                >
                  Copy
                </Button>
              </div>
              <div className="text-gray-700">{result.hashtags}</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-purple-700">
                  🎯 CTA:
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.cta)}
                >
                  Copy
                </Button>
              </div>
              <div className="text-gray-700 font-medium">{result.cta}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-purple-200">
            <div className="text-xs text-gray-500">
              Phong cách: <span className="font-medium">{result.style}</span> • 
              Platform: <span className="font-medium">{platform}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

