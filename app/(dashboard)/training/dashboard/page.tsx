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

export default function TrainingDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);

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

      const res = await fetch(
        `/api/training/dashboard/staff-summary?staffId=${staffId}`
      );
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        loadRecommendations(staffId);
      }
    } catch (err) {
      console.error("Load dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async (staffId: string) => {
    setLoadingRecs(true);
    try {
      const res = await fetch(
        `/api/training/dashboard/recommendations?staffId=${staffId}`
      );
      const data = await res.json();

      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error("Load recommendations error:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">⏳ Đang tải dashboard...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-red-600">
          Không tìm thấy dữ liệu
        </div>
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

  // Prepare timeline data
  const timelineData = summary.timeline.slice(0, 10).reverse();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">📊 Training Dashboard</h1>
        <p className="text-gray-600">
          Theo dõi tiến độ học tập và năng lực của bạn
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 border">
          <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
          <div className="text-2xl font-bold text-blue-600">
            {summary.kpis.completionRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Modules hoàn thành</div>
        </Card>

        <Card className="p-4 border">
          <div className="text-sm text-gray-600 mb-1">Skill Score</div>
          <div className="text-2xl font-bold text-green-600">
            {summary.kpis.averageSkillScore}
          </div>
          <div className="text-xs text-gray-500 mt-1">/ 100 điểm</div>
        </Card>

        <Card className="p-4 border">
          <div className="text-sm text-gray-600 mb-1">Roleplay</div>
          <div className="text-2xl font-bold text-purple-600">
            {summary.kpis.roleplayCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Avg: {summary.kpis.roleplayAverage} điểm
          </div>
        </Card>

        <Card className="p-4 border">
          <div className="text-sm text-gray-600 mb-1">Improvement</div>
          <div
            className={`text-2xl font-bold ${
              summary.kpis.improvementRate >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {summary.kpis.improvementRate >= 0 ? "+" : ""}
            {summary.kpis.improvementRate}
          </div>
          <div className="text-xs text-gray-500 mt-1">So với lần trước</div>
        </Card>

        <Card className="p-4 border">
          <div className="text-sm text-gray-600 mb-1">Level</div>
          <div className="text-2xl font-bold text-orange-600">
            {summary.staff.currentLevel || "N/A"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.levelProgress?.levelName || "Chưa có"}
          </div>
        </Card>
      </div>

      {/* Level Progress */}
      {summary.levelProgress && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">
            📈 Tiến độ lên Level tiếp theo
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  Level hiện tại: {summary.levelProgress.levelName} (Level{" "}
                  {summary.levelProgress.currentLevel})
                </div>
                <div className="text-sm text-gray-600">
                  Đã hoàn thành: {summary.levelProgress.completed} /{" "}
                  {summary.levelProgress.total} modules
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {summary.levelProgress.percent}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all"
                style={{ width: `${summary.levelProgress.percent}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Skill Radar Chart */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">
          🎯 Biểu đồ 5 kỹ năng cốt lõi
        </h2>
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

      {/* Weakness Alerts */}
      {summary.weakSkills.length > 0 && (
        <Card className="p-6 border bg-red-50">
          <h2 className="text-xl font-semibold mb-4 text-red-900">
            ⚠️ Cảnh báo: Kỹ năng cần cải thiện
          </h2>
          <div className="space-y-2">
            {summary.weakSkills.map((skill: string) => {
              const skillKey = skill
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace("problemsolving", "problemSolving")
                .replace("customerexperience", "customerExperience");
              const score = summary.skillAverages[skillKey];
              return (
                <div
                  key={skill}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg border border-red-200"
                >
                  <span className="text-red-600">⚠</span>
                  <span className="font-medium text-red-900">
                    {skill}: {score ? score.toFixed(1) : "N/A"}/20
                  </span>
                  <span className="text-sm text-red-700">
                    (Dưới ngưỡng 14/20)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && (
        <Card className="p-6 border bg-blue-50">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            💡 Gợi ý lộ trình tiếp theo
          </h2>
          {loadingRecs ? (
            <div className="text-center py-4">⏳ Đang tải gợi ý...</div>
          ) : (
            <div className="space-y-3">
              {recommendations.nextSteps?.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 bg-white rounded-lg border ${
                    step.priority === "high"
                      ? "border-red-300 bg-red-50"
                      : step.priority === "medium"
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{step.title}</div>
                      <div className="text-sm text-gray-700 mb-2">
                        {step.reason}
                      </div>
                      <div className="flex gap-3 text-xs text-gray-600">
                        <span>⏱️ {step.estimatedTime || "N/A"}</span>
                        {step.expectedImprovement && (
                          <span>📈 {step.expectedImprovement}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        step.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : step.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {step.priority === "high"
                        ? "Ưu tiên cao"
                        : step.priority === "medium"
                        ? "Ưu tiên trung bình"
                        : "Ưu tiên thấp"}
                    </span>
                  </div>
                </div>
              ))}
              {recommendations.timeline && (
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <div className="font-medium mb-1">⏰ Timeline:</div>
                  <div className="text-sm text-gray-700">
                    {recommendations.timeline}
                  </div>
                </div>
              )}
              {recommendations.targetScore && (
                <div className="mt-2 p-3 bg-white rounded-lg border">
                  <div className="font-medium mb-1">🎯 Điểm mục tiêu:</div>
                  <div className="text-sm text-gray-700">
                    {recommendations.targetScore}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Progress Timeline */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">
          📅 Timeline học tập (30 ngày gần nhất)
        </h2>
        {timelineData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có hoạt động trong 30 ngày qua
          </div>
        ) : (
          <div className="space-y-4">
            {timelineData.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div
                  className={`w-3 h-3 rounded-full mt-1.5 ${
                    item.type === "module" ? "bg-blue-500" : "bg-purple-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(item.date).toLocaleString("vi-VN")}
                  </div>
                </div>
                {item.score !== null && (
                  <div className="text-lg font-semibold text-gray-700">
                    {item.score} điểm
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Certifications */}
      {summary.certifications && summary.certifications.length > 0 && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">
            🏆 Chứng chỉ đã đạt được
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.certifications.map((cert: any) => (
              <div
                key={cert.id}
                className="p-4 border rounded-lg bg-yellow-50 border-yellow-200"
              >
                <div className="font-semibold text-yellow-900">
                  {cert.role} - {cert.level}
                </div>
                <div className="text-sm text-yellow-700">
                  Cấp ngày:{" "}
                  {new Date(cert.issueDate).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

