"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { getSkillLevelColor } from "@/core/skills/scoreCalculator";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function SkillAssessmentsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user ID (in production, get from auth)
      const staffId = localStorage.getItem("userId");
      if (!staffId) {
        alert("Vui lòng đăng nhập");
        return;
      }

      const [summaryRes, historyRes] = await Promise.all([
        fetch(`/api/training/skill/summary?staffId=${staffId}`),
        fetch(`/api/training/skill/history?staffId=${staffId}&limit=10`),
      ]);

      const summaryData = await summaryRes.json();
      const historyData = await historyRes.json();

      if (summaryData.success) {
        setSummary(summaryData.summary);
      }
      if (historyData.success) {
        setHistory(historyData.assessments);
      }
    } catch (err) {
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  if (!summary || summary.totalAssessments === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">📊 Skill Assessment</h1>
        <Card className="p-6 border text-center">
          <div className="text-gray-500">
            Chưa có đánh giá kỹ năng nào. Hãy hoàn thành roleplay hoặc bài tập
            để được đánh giá.
          </div>
        </Card>
      </div>
    );
  }

  // Prepare radar chart data
  const radarData = [
    {
      skill: "Communication",
      score: summary.skillAverages.communication,
      fullMark: 20,
    },
    {
      skill: "Technical",
      score: summary.skillAverages.technical,
      fullMark: 20,
    },
    {
      skill: "Problem",
      score: summary.skillAverages.problemSolving,
      fullMark: 20,
    },
    {
      skill: "Experience",
      score: summary.skillAverages.customerExperience,
      fullMark: 20,
    },
    {
      skill: "Upsale",
      score: summary.skillAverages.upsale,
      fullMark: 20,
    },
  ];

  // Prepare trend chart data
  const trendData = summary.trends.map((t: any, idx: number) => ({
    name: `Lần ${idx + 1}`,
    score: t.totalScore,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">📊 Skill Assessment Dashboard</h1>
        <p className="text-gray-600">
          Đánh giá năng lực và tiến bộ kỹ năng của bạn
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="p-6 border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Tổng điểm trung bình</div>
            <div className="text-4xl font-bold text-blue-600">
              {summary.averageScore}
            </div>
            <div className="text-sm text-gray-500">/ 100</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Xếp loại</div>
            <div
              className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${getSkillLevelColor(
                summary.currentLevel
              )}`}
            >
              {summary.currentLevel}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Số lần đánh giá</div>
            <div className="text-4xl font-bold text-purple-600">
              {summary.totalAssessments}
            </div>
          </div>
        </div>
      </Card>

      {/* Skill Radar Chart */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">📈 Điểm số từng kỹ năng</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <PolarRadiusAxis angle={90} domain={[0, 20]} />
            <Radar
              name="Skills"
              dataKey="score"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Skill Details */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(summary.skillAverages).map(([key, value]: [string, any]) => (
          <Card key={key} className="p-4 border">
            <div className="text-sm text-gray-600 mb-2">
              {key === "communication"
                ? "Communication"
                : key === "technical"
                ? "Technical"
                : key === "problemSolving"
                ? "Problem Solving"
                : key === "customerExperience"
                ? "Experience"
                : "Upsale"}
            </div>
            <div className="text-2xl font-bold text-gray-900">{value.toFixed(1)}</div>
            <div className="text-xs text-gray-500">/ 20</div>
            <div className="mt-2">
              <div
                className="h-2 bg-gray-200 rounded-full overflow-hidden"
                style={{ width: "100%" }}
              >
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${(value / 20) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Trend Chart */}
      {trendData.length > 1 && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">📉 Xu hướng điểm số</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Weak Skills */}
      {summary.weakSkills.length > 0 && (
        <Card className="p-6 border bg-red-50">
          <h2 className="text-xl font-semibold mb-4 text-red-900">
            ⚠️ Kỹ năng cần cải thiện
          </h2>
          <div className="flex flex-wrap gap-2">
            {summary.weakSkills.map((skill: string) => (
              <span
                key={skill}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {summary.latestAssessment?.recommendations && (
        <Card className="p-6 border bg-blue-50">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            💡 Gợi ý đào tạo cá nhân hóa
          </h2>
          {summary.latestAssessment.recommendations.recommendations && (
            <div className="space-y-3">
              {summary.latestAssessment.recommendations.recommendations.map(
                (rec: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-blue-200"
                  >
                    <div className="font-medium mb-1">{rec.title}</div>
                    <div className="text-sm text-gray-600">{rec.reason}</div>
                  </div>
                )
              )}
            </div>
          )}
          {summary.latestAssessment.recommendations.learningPath && (
            <div className="mt-4">
              <div className="font-medium mb-2">Lộ trình học tập:</div>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                {summary.latestAssessment.recommendations.learningPath.map(
                  (step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  )
                )}
              </ol>
            </div>
          )}
        </Card>
      )}

      {/* Latest Assessment Details */}
      {summary.latestAssessment && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">📋 Đánh giá mới nhất</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.latestAssessment.strengths &&
              summary.latestAssessment.strengths.length > 0 && (
                <div>
                  <div className="font-medium text-green-700 mb-2">✅ Điểm mạnh:</div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {summary.latestAssessment.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            {summary.latestAssessment.improvements &&
              summary.latestAssessment.improvements.length > 0 && (
                <div>
                  <div className="font-medium text-orange-700 mb-2">
                    🔧 Cần cải thiện:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {summary.latestAssessment.improvements.map(
                      (i: string, idx: number) => (
                        <li key={idx}>{i}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">📜 Lịch sử đánh giá</h2>
          <div className="space-y-3">
            {history.map((assessment) => (
              <div
                key={assessment.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{assessment.source}</div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm ${getSkillLevelColor(
                      assessment.level
                    )}`}
                  >
                    {assessment.totalScore}/100 - {assessment.level}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(assessment.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

