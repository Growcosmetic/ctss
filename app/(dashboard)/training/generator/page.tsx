"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface Module {
  id: string;
  title: string;
  order: number;
}

export default function LessonGeneratorPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [topic, setTopic] = useState("");
  const [order, setOrder] = useState("");
  const [level, setLevel] = useState("beginner");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadModules = async () => {
    try {
      const res = await fetch("/api/training/curriculum");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load modules");
      }

      setModules(data.modules || []);
    } catch (err: any) {
      console.error("Load modules error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const generate = async () => {
    if (!moduleId || !topic.trim()) {
      setError("Vui lòng chọn module và nhập chủ đề bài học");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/training/lesson/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          topic: topic.trim(),
          order: order ? Number(order) : undefined,
          level,
          focus: focus.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate lesson");
      }

      setResult(data.lesson);
      setTopic(""); // Clear topic after success
      setOrder(""); // Clear order
      setFocus(""); // Clear focus
    } catch (err: any) {
      console.error("Generate lesson error:", err);
      setError(err.message || "Có lỗi xảy ra khi tạo bài học");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📘 AI Lesson Generator</h1>
        <p className="text-gray-600">
          Tự động tạo bài học kỹ thuật cho stylist bằng AI
        </p>
      </div>

      <Card className="p-6 border space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Chọn Module *
          </label>
          <Select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
            <option value="">Chọn module...</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.order}. {m.title}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Chủ đề bài học *
          </label>
          <Input
            placeholder="Ví dụ: Uốn nóng - Kiểm soát độ ẩm tóc (Hydration Control)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Thứ tự bài học (tùy chọn)
            </label>
            <Input
              type="number"
              placeholder="Tự động nếu để trống"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Trình độ
            </label>
            <Select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Trọng tâm (tùy chọn)
          </label>
          <Input
            placeholder="Ví dụ: Safety và step-by-step, Tips thực tế..."
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          />
        </div>

        <Button
          onClick={generate}
          disabled={loading || !moduleId || !topic.trim()}
          className="w-full py-3 text-base"
        >
          {loading
            ? "⏳ Đang tạo bài học bằng AI..."
            : "✨ Tạo bài học"}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <Card className="p-6 border space-y-4 bg-gradient-to-br from-indigo-50 to-blue-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">✅ Bài học đã tạo thành công</h2>
            <div className="text-sm text-gray-600">
              Module: {result.module?.title}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border space-y-4">
            <div>
              <span className="text-lg font-semibold text-indigo-600">
                {result.order}.
              </span>{" "}
              <span className="text-xl font-bold text-gray-900">
                {result.title}
              </span>
            </div>

            {result.content?.duration && (
              <div className="text-sm text-gray-600">
                ⏱ Thời lượng: {result.content.duration}
              </div>
            )}

            {result.content?.text && (
              <div className="text-gray-700 whitespace-pre-line leading-relaxed border-t pt-4">
                {result.content.text}
              </div>
            )}

            {result.content?.keyPoints &&
              Array.isArray(result.content.keyPoints) &&
              result.content.keyPoints.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    📌 Key Points:
                  </div>
                  <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                    {result.content.keyPoints.map((k: string, i: number) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}

            {result.content?.mistakes &&
              Array.isArray(result.content.mistakes) &&
              result.content.mistakes.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold text-red-700 mb-2">
                    ⚠️ Lỗi thường gặp:
                  </div>
                  <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                    {result.content.mistakes.map((m: string, i: number) => (
                      <li key={i} className="text-red-800">{m}</li>
                    ))}
                  </ul>
                </div>
              )}

            {result.content?.fixes &&
              Array.isArray(result.content.fixes) &&
              result.content.fixes.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold text-green-700 mb-2">
                    ✅ Cách xử lý:
                  </div>
                  <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                    {result.content.fixes.map((f: string, i: number) => (
                      <li key={i} className="text-green-800">{f}</li>
                    ))}
                  </ul>
                </div>
              )}

            {result.content?.tips &&
              Array.isArray(result.content.tips) &&
              result.content.tips.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold text-amber-700 mb-2">
                    💡 Tips từ Master Stylist:
                  </div>
                  <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                    {result.content.tips.map((t: string, i: number) => (
                      <li key={i} className="text-amber-800">{t}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700">
              ✅ Bài học đã được lưu vào module{" "}
              <strong>{result.module?.title}</strong>. Bạn có thể xem trong{" "}
              <a
                href="/training/curriculum"
                className="underline font-semibold"
              >
                Curriculum
              </a>
              .
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

