"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SkillDashboard() {
  const [data, setData] = useState<any>(null);
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get actual userId from auth context
  const userId = "stylist_01";

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/training/skill/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load skill data");
      }

      setData(data);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const loadInsight = async () => {
    setLoadingInsight(true);
    try {
      const res = await fetch("/api/training/skill/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load insight");
      }

      setInsight(data.insight);
    } catch (err: any) {
      console.error("Load insight error:", err);
    } finally {
      setLoadingInsight(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải tiến độ...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="p-6 border bg-red-50">
          <div className="text-red-600 mb-4">
            {error || "Không tìm thấy dữ liệu"}
          </div>
          <Button onClick={load}>Thử lại</Button>
        </Card>
      </div>
    );
  }

  const skillLabels: Record<string, string> = {
    questioning: "Đặt câu hỏi",
    analysis: "Phân tích",
    suggestion: "Gợi ý",
    emotion: "Xử lý cảm xúc",
    closing: "Chốt dịch vụ",
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return "📈";
    if (trend === "down") return "📉";
    return "➡️";
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📊 Skill Tracking Dashboard</h1>
        <p className="text-gray-600">
          Theo dõi tiến độ và kỹ năng của stylist
        </p>
      </div>

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-sm text-gray-600 mb-1">Điểm trung bình</div>
          <div className="text-3xl font-bold text-blue-600">
            {data.overview.overallAverage}/10
          </div>
        </Card>
        <Card className="p-4 border bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="text-sm text-gray-600 mb-1">Bài test đã làm</div>
          <div className="text-3xl font-bold text-green-600">
            {data.overview.completedQuizzes}
          </div>
        </Card>
        <Card className="p-4 border bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-sm text-gray-600 mb-1">Mô phỏng đã hoàn thành</div>
          <div className="text-3xl font-bold text-purple-600">
            {data.overview.completedSimulations}
          </div>
        </Card>
        <Card className="p-4 border bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="text-sm text-gray-600 mb-1">Lần chấm điểm</div>
          <div className="text-3xl font-bold text-orange-600">
            {data.overview.totalSkillsTracked}
          </div>
        </Card>
      </div>

      {/* SKILL AVERAGES */}
      <Card className="p-6 border bg-white">
        <h2 className="text-xl font-semibold mb-4">
          Điểm trung bình theo kỹ năng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(data.overview.skillAverages).map(([skill, score]: any) => {
            const trend = data.overview.trends[skill] || "stable";
            const percentage = (score / 10) * 100;

            return (
              <div
                key={skill}
                className="p-4 bg-gray-50 border rounded-lg text-center space-y-2"
              >
                <div className="text-sm font-medium text-gray-700">
                  {skillLabels[skill] || skill}
                </div>
                <div className="text-3xl font-bold text-indigo-600">{score}/10</div>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span className={getTrendColor(trend)}>{getTrendIcon(trend)}</span>
                  <span className="text-gray-500 text-xs">
                    {trend === "up" ? "Tăng" : trend === "down" ? "Giảm" : "Ổn định"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      percentage >= 80
                        ? "bg-green-500"
                        : percentage >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI INSIGHT */}
      <Card className="p-6 border bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">🤖 AI Skill Insights</h2>
          <Button
            onClick={loadInsight}
            disabled={loadingInsight}
            variant="outline"
            size="sm"
          >
            {loadingInsight ? "Đang phân tích..." : "Phân tích kỹ năng"}
          </Button>
        </div>

        {insight && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="font-semibold text-red-700 mb-2">
                ⚠️ Kỹ năng cần cải thiện: {skillLabels[insight.weakSkill] || insight.weakSkill}
              </div>
              <div className="text-sm text-gray-700">{insight.reason}</div>
            </div>

            {insight.practice && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="font-semibold text-blue-700 mb-2">
                  💪 Bài tập gợi ý:
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {insight.practice}
                </div>
              </div>
            )}

            {insight.improvementPlan && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="font-semibold text-green-700 mb-2">
                  📋 Kế hoạch cải thiện:
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {insight.improvementPlan}
                </div>
              </div>
            )}

            {insight.recommendedLessons &&
              insight.recommendedLessons.length > 0 && (
                <div className="p-4 bg-white rounded-lg border">
                  <div className="font-semibold text-purple-700 mb-2">
                    📚 Bài học nên xem lại:
                  </div>
                  <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                    {insight.recommendedLessons.map((lesson: string, i: number) => (
                      <li key={i}>{lesson}</li>
                    ))}
                  </ul>
                </div>
              )}

            {insight.suggestedSimulations &&
              insight.suggestedSimulations.length > 0 && (
                <div className="p-4 bg-white rounded-lg border">
                  <div className="font-semibold text-orange-700 mb-2">
                    🎭 Tình huống mô phỏng gợi ý:
                  </div>
                  <div className="space-y-2 text-sm">
                    {insight.suggestedSimulations.map((sim: any, i: number) => (
                      <div key={i} className="p-2 bg-gray-50 rounded border">
                        <div className="font-medium">{sim.scenario}</div>
                        <div className="text-xs text-gray-600">
                          Persona: {sim.persona} • Focus: {sim.focus || "All skills"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {insight.expectedOutcome && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="font-semibold text-indigo-700 mb-2">
                  🎯 Kết quả mong đợi:
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {insight.expectedOutcome}
                </div>
              </div>
            )}
          </div>
        )}

        {!insight && !loadingInsight && (
          <div className="text-center text-gray-500 py-8">
            Nhấn "Phân tích kỹ năng" để nhận gợi ý cải thiện từ AI
          </div>
        )}
      </Card>

      {/* SKILL HISTORY */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">Lịch sử chấm điểm</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.skillHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Chưa có lịch sử chấm điểm
            </div>
          ) : (
            data.skillHistory.slice(-20).reverse().map((s: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-gray-50 border rounded flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {skillLabels[s.skill] || s.skill}
                  </div>
                  <div className="text-xs text-gray-500">
                    {s.source === "quiz" ? "📝 Bài test" : "🎭 Mô phỏng"} •{" "}
                    {new Date(s.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div className="text-xl font-bold text-indigo-600">{s.score}/10</div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* QUIZ RESULTS */}
      {data.quizResults.length > 0 && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">Kết quả bài test</h2>
          <div className="space-y-2">
            {data.quizResults.slice(0, 10).map((q: any) => (
              <div
                key={q.id}
                className="p-3 bg-gray-50 border rounded flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{q.lesson}</div>
                  <div className="text-xs text-gray-500">{q.module}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600">
                    {q.score}/{q.total} ({q.percentage}%)
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(q.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SIMULATION SESSIONS */}
      {data.simulations.length > 0 && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">Phiên mô phỏng</h2>
          <div className="space-y-2">
            {data.simulations.slice(0, 10).map((s: any) => (
              <div
                key={s.id}
                className="p-3 bg-gray-50 border rounded"
              >
                <div className="font-medium">{s.scenario}</div>
                <div className="text-xs text-gray-500 mb-2">
                  Persona: {s.persona} • {s.status === "completed" ? "✅ Hoàn thành" : "⏳ Đang diễn ra"}
                </div>
                {s.score !== null && (
                  <div className="text-sm font-semibold text-indigo-600">
                    Điểm: {s.score}/100
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

