"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CurriculumPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/training/curriculum");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load curriculum");
      }

      setModules(data.modules || []);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getModuleColor = (index: number) => {
    const colors = [
      "from-blue-50 to-indigo-50",
      "from-purple-50 to-pink-50",
      "from-green-50 to-emerald-50",
      "from-orange-50 to-amber-50",
      "from-red-50 to-rose-50",
      "from-teal-50 to-cyan-50",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải chương trình đào tạo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="p-6 border bg-red-50">
          <div className="text-red-600 mb-4">Lỗi: {error}</div>
          <Button onClick={load}>Thử lại</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🎓 Chương trình đào tạo Stylist</h1>
        <p className="text-gray-600">
          Khung chương trình đào tạo stylist chuẩn quốc tế - Chí Tâm Hair Salon
        </p>
      </div>

      {modules.length === 0 ? (
        <Card className="p-6 border text-center">
          <div className="text-gray-500">
            Chưa có module nào. Vui lòng thêm module để bắt đầu.
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {modules.map((m: any, moduleIndex: number) => (
            <Card
              key={m.id}
              className={`p-6 border bg-gradient-to-br ${getModuleColor(moduleIndex)}`}
            >
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-gray-700">
                    {m.order}.
                  </span>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {m.title}
                  </h2>
                </div>
                {m.desc && (
                  <p className="text-gray-700 ml-8">{m.desc}</p>
                )}
              </div>

              {m.lessons && m.lessons.length > 0 ? (
                <div className="space-y-3 ml-8">
                  {m.lessons.map((lesson: any) => (
                    <Card
                      key={lesson.id}
                      className="p-4 border bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg font-semibold text-indigo-600">
                          {lesson.order}.
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {lesson.title}
                          </h3>
                          {lesson.content && (
                            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                              {typeof lesson.content === "string"
                                ? lesson.content
                                : lesson.content.text || JSON.stringify(lesson.content)}
                            </div>
                          )}
                          {lesson.content?.keyPoints &&
                            Array.isArray(lesson.content.keyPoints) && (
                              <ul className="mt-2 space-y-1">
                                {lesson.content.keyPoints.map(
                                  (point: string, i: number) => (
                                    <li
                                      key={i}
                                      className="text-sm text-gray-600 flex items-start gap-2"
                                    >
                                      <span className="text-indigo-500">•</span>
                                      <span>{point}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="ml-8 text-sm text-gray-500 italic">
                  Chưa có bài học nào trong module này
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

