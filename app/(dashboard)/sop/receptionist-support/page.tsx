"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ReceptionistSupportPage() {
  const [situation, setSituation] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [support, setSupport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const commonSituations = [
    "Khách khó tính, phàn nàn",
    "Khách gấp, đòi làm ngay",
    "Khách đòi stylist A nhưng A bận",
    "Khách muốn hoàn tiền",
    "Khách không hài lòng với kết quả",
    "Khách walk-in nhưng salon đầy",
  ];

  const handleSituationClick = (sit: string) => {
    setSituation(sit);
  };

  const getSupport = async () => {
    if (!situation.trim()) {
      setError("Vui lòng nhập tình huống");
      return;
    }

    setLoading(true);
    setError(null);
    setSupport(null);

    try {
      const res = await fetch("/api/sop/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situation.trim(),
          context: context.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to get support");
      }

      setSupport(data.support);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🤝 AI Hỗ trợ Lễ Tân</h1>
        <p className="text-gray-600">
          Hỗ trợ xử lý các tình huống khó, đặc biệt
        </p>
      </div>

      <Card className="p-6 border space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Tình huống gặp phải *
          </label>
          <Input
            placeholder="Ví dụ: Khách khó tính, phàn nàn về dịch vụ..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          />
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-2">Tình huống thường gặp:</div>
            <div className="flex flex-wrap gap-2">
              {commonSituations.map((sit) => (
                <button
                  key={sit}
                  onClick={() => handleSituationClick(sit)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full border"
                >
                  {sit}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Ngữ cảnh bổ sung (tùy chọn)
          </label>
          <Input
            placeholder="Ví dụ: Khách là VIP, lần đầu đến salon..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        <Button
          onClick={getSupport}
          disabled={loading || !situation.trim()}
          className="w-full py-3 text-base"
        >
          {loading ? "⏳ Đang phân tích..." : "💡 Nhận hỗ trợ từ AI"}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </Card>

      {support && (
        <Card className="p-6 border bg-gradient-to-br from-blue-50 to-indigo-50 space-y-4">
          <h2 className="text-xl font-semibold">💡 Gợi ý xử lý</h2>

          {support.analysis && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-blue-700 mb-2">📊 Phân tích:</div>
              <div className="text-sm text-gray-700">{support.analysis}</div>
            </div>
          )}

          {support.approach && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-indigo-700 mb-2">🎯 Cách tiếp cận:</div>
              <div className="text-sm text-gray-700">{support.approach}</div>
            </div>
          )}

          {support.steps && Array.isArray(support.steps) && support.steps.length > 0 && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-green-700 mb-3">📝 Các bước thực hiện:</div>
              <div className="space-y-2">
                {support.steps.map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="font-semibold text-green-600">{i + 1}.</span>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {support.phrases && Array.isArray(support.phrases) && support.phrases.length > 0 && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-purple-700 mb-3">💬 Câu nói mẫu:</div>
              <div className="space-y-2">
                {support.phrases.map((phrase: string, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-gray-800 italic"
                  >
                    "{phrase}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {support.doNot && Array.isArray(support.doNot) && support.doNot.length > 0 && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-red-700 mb-3">❌ Không nên:</div>
              <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                {support.doNot.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {support.escalate && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="font-semibold text-amber-700 mb-2">⚠️ Khi nào cần báo quản lý:</div>
              <div className="text-sm text-gray-700">{support.escalate}</div>
            </div>
          )}

          {support.expectedOutcome && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-semibold text-green-700 mb-2">✅ Kết quả mong đợi:</div>
              <div className="text-sm text-gray-700">{support.expectedOutcome}</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

