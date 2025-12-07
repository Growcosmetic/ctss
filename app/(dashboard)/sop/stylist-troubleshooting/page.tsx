"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

export default function StylistTroubleshootingPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/stylist/troubleshooting");
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load troubleshooting guides");
        }

        setGuides(data.guides || []);
        if (data.guides && data.guides.length > 0) {
          setSelectedGuide(data.guides[0]);
        }
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="p-6 border bg-red-50">
          <div className="text-red-600 mb-4">Lỗi: {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🔧 SOP Xử lý Rủi ro Kỹ thuật</h1>
        <p className="text-gray-600">
          Hướng dẫn xử lý các tình huống rủi ro kỹ thuật thường gặp
        </p>
      </div>

      <Card className="p-4 border">
        <select
          value={selectedGuide?.id || ""}
          onChange={(e) => {
            const guide = guides.find((g) => g.id === e.target.value);
            setSelectedGuide(guide);
          }}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Chọn tình huống...</option>
          {guides.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </Card>

      {selectedGuide && (
        <Card className="p-6 border space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{selectedGuide.title}</h2>
            <p className="text-gray-700">{selectedGuide.description}</p>
          </div>

          {/* Symptoms */}
          {selectedGuide.symptoms && selectedGuide.symptoms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-3">
                🔍 Triệu chứng:
              </h3>
              <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                {selectedGuide.symptoms.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Causes */}
          {selectedGuide.causes && selectedGuide.causes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orange-700 mb-3">
                ⚠️ Nguyên nhân:
              </h3>
              <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                {selectedGuide.causes.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Solutions */}
          {selectedGuide.solutions && selectedGuide.solutions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-3">
                ✅ Cách xử lý:
              </h3>
              <div className="space-y-3">
                {selectedGuide.solutions.map((sol: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-green-700">
                        Bước {sol.step}:
                      </span>
                      <span className="text-sm text-gray-800 flex-1">
                        {sol.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prevention */}
          {selectedGuide.prevention && selectedGuide.prevention.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-3">
                🛡️ Cách phòng ngừa:
              </h3>
              <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                {selectedGuide.prevention.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Escalation */}
          {selectedGuide.whenToEscalate && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="text-lg font-semibold text-amber-700 mb-2">
                ⚠️ Khi nào cần báo quản lý:
              </h3>
              <p className="text-sm text-gray-700">
                {selectedGuide.whenToEscalate}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

