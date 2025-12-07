"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function ReelsPage() {
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
      const res = await fetch("/api/marketing/reels", {
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
        throw new Error(data.error || "Failed to generate reels script");
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">🎬 AI Reels/Shorts Generator</h1>
        <p className="text-gray-600">
          Tạo kịch bản video ngắn cho TikTok, Instagram Reels, YouTube Shorts
        </p>
      </div>

      <Card className="p-6 space-y-4 border">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Chủ đề *
          </label>
          <Input
            placeholder="Ví dụ: Uốn layer Hàn, nhuộm balayage, tóc phồng..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Mục tiêu *
          </label>
          <Input
            placeholder="Ví dụ: Viral, đặt lịch, nhận diện thương hiệu..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nền tảng *
          </label>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">Chọn nền tảng</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram Reels</option>
            <option value="youtube">YouTube Shorts</option>
            <option value="facebook">Facebook Shorts</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Phong cách video *
          </label>
          <Select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="">Chọn phong cách</option>
            <option value="viral">Viral - Hấp dẫn, trending</option>
            <option value="chill">Chill - Thư giãn, nhẹ nhàng</option>
            <option value="luxury">Luxury - Sang trọng, cao cấp</option>
            <option value="professional">Professional - Chuyên nghiệp</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Context thêm (tùy chọn)
          </label>
          <Textarea
            placeholder="Yêu cầu đặc biệt, ý tưởng muốn có trong video..."
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
          {loading ? "⏳ Đang tạo kịch bản..." : "🎬 Tạo kịch bản video"}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <Card className="p-6 space-y-6 border bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">🔮 Kịch bản video</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const fullScript = `Ý TƯỞNG: ${result.idea}\n\nHOOK: ${result.hook}\n\nKỊCH BẢN:\n${result.script}\n\nSHOT LIST:\n${result.visualGuide?.join("\n")}\n\nNHẠC: ${result.audioSuggestion}\n\nCTA: ${result.cta}`;
                copyToClipboard(fullScript);
              }}
            >
              📋 Copy tất cả
            </Button>
          </div>

          <div className="space-y-5">
            {/* Idea */}
            <div className="bg-white p-4 rounded-lg border border-pink-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-pink-700">
                  💡 Ý tưởng:
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.idea)}
                >
                  Copy
                </Button>
              </div>
              <div className="text-gray-900 font-medium">{result.idea}</div>
            </div>

            {/* Hook */}
            <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-red-700">
                  🎯 Hook (1-3 giây đầu):
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.hook)}
                >
                  Copy
                </Button>
              </div>
              <div className="text-red-900 font-bold text-lg">{result.hook}</div>
            </div>

            {/* Script */}
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-purple-700">
                  📝 Kịch bản thoại:
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.script)}
                >
                  Copy
                </Button>
              </div>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {result.script}
              </div>
            </div>

            {/* Visual Guide */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-blue-700">
                  🎥 Gợi ý cảnh quay (Shot List):
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(result.visualGuide?.join("\n") || "")
                  }
                >
                  Copy
                </Button>
              </div>
              <ul className="space-y-2">
                {result.visualGuide?.map((v: string, i: number) => (
                  <li key={i} className="text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">
                      Shot {i + 1}:
                    </span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Audio Suggestion */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-green-700">
                  🎵 Nhạc gợi ý:
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.audioSuggestion)}
                >
                  Copy
                </Button>
              </div>
              <div className="text-gray-700">{result.audioSuggestion}</div>
            </div>

            {/* CTA */}
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-amber-700">
                  📢 CTA (Call-to-action):
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.cta)}
                >
                  Copy
                </Button>
              </div>
              <div className="text-gray-900 font-semibold">{result.cta}</div>
            </div>

            {/* Metadata */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  ⏱️ Thời lượng: <span className="font-medium">{result.duration || "10-20s"}</span>
                </span>
                <span>
                  Phong cách: <span className="font-medium">{result.style}</span>
                </span>
                <span>
                  Platform: <span className="font-medium">{platform}</span>
                </span>
              </div>
              {result.hashtags && (
                <div className="mt-2 text-xs">
                  <span className="font-medium text-gray-600">Hashtags:</span>{" "}
                  <span className="text-gray-500">{result.hashtags}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

