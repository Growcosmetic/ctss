"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getSkillLevelColor } from "@/core/skills/scoreCalculator";

export default function CertificationPage() {
  const [eligibility, setEligibility] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

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

      const [eligibilityRes, certsRes] = await Promise.all([
        fetch(`/api/training/certification/check-promotion?staffId=${staffId}`),
        fetch(`/api/training/certification/list?staffId=${staffId}`),
      ]);

      const eligibilityData = await eligibilityRes.json();
      const certsData = await certsRes.json();

      if (eligibilityData.success) {
        setEligibility(eligibilityData);
      }
      if (certsData.success) {
        setCertifications(certsData.certifications);
      }
    } catch (err) {
      console.error("Load certification data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!confirm("Xác nhận thăng cấp?")) return;

    setPromoting(true);
    try {
      const staffId = localStorage.getItem("userId");
      if (!staffId) {
        alert("Vui lòng đăng nhập");
        return;
      }

      const res = await fetch("/api/training/certification/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          autoPromote: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadData();
      } else {
        alert("Có lỗi: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Promote error:", err);
      alert("Có lỗi xảy ra");
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🏆 Certification & Promotion</h1>
        <p className="text-gray-600">
          Theo dõi chứng chỉ và điều kiện thăng cấp
        </p>
      </div>

      {/* Current Level */}
      {eligibility && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">📊 Cấp độ hiện tại</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Level hiện tại</div>
              <div className="text-2xl font-bold text-blue-600">
                Level {eligibility.criteria?.level - 1 || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Cấp độ tiếp theo</div>
              <div className="text-2xl font-bold text-purple-600">
                {eligibility.criteria?.name || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
              <div
                className={`text-lg font-semibold ${
                  eligibility.eligible
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {eligibility.eligible ? "✅ Đủ điều kiện" : "⏳ Chưa đủ điều kiện"}
              </div>
            </div>
          </div>

          {/* Promotion Button */}
          {eligibility.eligible && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handlePromote}
                disabled={promoting}
                className="bg-green-600 text-lg px-8 py-3"
              >
                {promoting ? "⏳ Đang xử lý..." : "🎉 Thăng cấp ngay"}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Requirements Status */}
      {eligibility && eligibility.status && (
        <Card className="p-6 border">
          <h2 className="text-xl font-semibold mb-4">
            📋 Điều kiện thăng cấp
          </h2>
          <div className="space-y-3">
            {/* Module Completion */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Hoàn thành module</div>
                <div className="text-sm text-gray-600">
                  Yêu cầu: ≥ {eligibility.status.moduleCompletionRate.required}%
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold ${
                    eligibility.status.moduleCompletionRate.passed
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {eligibility.status.moduleCompletionRate.actual}%
                </div>
                {eligibility.status.moduleCompletionRate.passed ? (
                  <span className="text-green-600">✅</span>
                ) : (
                  <span className="text-red-600">❌</span>
                )}
              </div>
            </div>

            {/* Average Roleplay Score */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Điểm roleplay trung bình</div>
                <div className="text-sm text-gray-600">
                  Yêu cầu: ≥ {eligibility.status.averageRoleplayScore.required}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold ${
                    eligibility.status.averageRoleplayScore.passed
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {eligibility.status.averageRoleplayScore.actual}
                </div>
                {eligibility.status.averageRoleplayScore.passed ? (
                  <span className="text-green-600">✅</span>
                ) : (
                  <span className="text-red-600">❌</span>
                )}
              </div>
            </div>

            {/* Min Roleplay Count */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Số buổi roleplay</div>
                <div className="text-sm text-gray-600">
                  Yêu cầu: ≥ {eligibility.status.minRoleplayCount.required}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold ${
                    eligibility.status.minRoleplayCount.passed
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {eligibility.status.minRoleplayCount.actual}
                </div>
                {eligibility.status.minRoleplayCount.passed ? (
                  <span className="text-green-600">✅</span>
                ) : (
                  <span className="text-red-600">❌</span>
                )}
              </div>
            </div>

            {/* Min Skill Score */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Kỹ năng tối thiểu</div>
                <div className="text-sm text-gray-600">
                  Yêu cầu: ≥ {eligibility.status.minSkillScore.required}/20
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-bold ${
                    eligibility.status.minSkillScore.passed
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {eligibility.status.minSkillScore.actual}/20
                </div>
                {eligibility.status.minSkillScore.passed ? (
                  <span className="text-green-600">✅</span>
                ) : (
                  <span className="text-red-600">❌</span>
                )}
              </div>
            </div>

            {/* Specific Modules */}
            {eligibility.status.specificModules &&
              eligibility.status.specificModules.length > 0 && (
                <div className="mt-4">
                  <div className="font-medium mb-2">Module bắt buộc:</div>
                  <div className="space-y-2">
                    {eligibility.status.specificModules.map(
                      (m: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">{m.module}</span>
                          {m.completed ? (
                            <span className="text-green-600">✅</span>
                          ) : (
                            <span className="text-red-600">❌</span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Specific Roleplays */}
            {eligibility.status.specificRoleplays &&
              eligibility.status.specificRoleplays.length > 0 && (
                <div className="mt-4">
                  <div className="font-medium mb-2">Roleplay bắt buộc:</div>
                  <div className="space-y-2">
                    {eligibility.status.specificRoleplays.map(
                      (r: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">
                            {r.type.replace("khach_", "").replace("_", " ")}: ≥{" "}
                            {r.required}
                          </span>
                          <div className="text-right">
                            <span
                              className={`font-medium ${
                                r.passed ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {r.actualScore}
                            </span>
                            {r.passed ? (
                              <span className="text-green-600 ml-2">✅</span>
                            ) : (
                              <span className="text-red-600 ml-2">❌</span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </Card>
      )}

      {/* Certifications History */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">📜 Lịch sử chứng chỉ</h2>
        {certifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có chứng chỉ nào
          </div>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">
                      {cert.levelData?.role?.name} - {cert.levelData?.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Level {cert.level} • Cấp ngày:{" "}
                      {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}
                    </div>
                    {cert.metadata?.averageScore && (
                      <div className="text-sm text-gray-600">
                        Điểm trung bình: {cert.metadata.averageScore}/100
                      </div>
                    )}
                  </div>
                  <div className="text-3xl">🏆</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

