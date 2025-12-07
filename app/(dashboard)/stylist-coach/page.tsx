"use client";

import { useState } from "react";
import { useStylistCoach } from "@/features/stylistCoach/hooks/useStylistCoach";
import { StylistCoachPanel } from "@/features/stylistCoach/components/StylistCoachPanel";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/Input";

export default function StylistCoachPage() {
  const { data, loading, error, analyze } = useStylistCoach();

  const [form, setForm] = useState({
    hairCondition: "",
    hairHistory: "",
    customerGoal: "",
    curlType: "",
    hairDamageLevel: "",
    stylistNote: ""
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = () => {
    analyze(form);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">
        🧠 AI Stylist Coach — Phân tích kỹ thuật
      </h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div>
          <label className="text-sm font-medium">Tình trạng tóc</label>
          <Textarea
            value={form.hairCondition}
            onChange={(e) => updateField("hairCondition", e.target.value)}
            placeholder="Ví dụ: Khô, xốp, đuôi chẻ ngọn..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Lịch sử hóa chất</label>
          <Textarea
            value={form.hairHistory}
            onChange={(e) => updateField("hairHistory", e.target.value)}
            placeholder="Ví dụ: Tẩy 1 lần, uốn 6 tháng trước..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Mục tiêu khách hàng</label>
          <Textarea
            value={form.customerGoal}
            onChange={(e) => updateField("customerGoal", e.target.value)}
            placeholder="Ví dụ: Muốn tóc mềm mượt, không bị phồng, muốn vào nếp..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Loại xoăn mong muốn</label>
          <Input
            value={form.curlType}
            onChange={(e) => updateField("curlType", e.target.value)}
            placeholder="Ví dụ: Wavy 2B, Classic C, Digital Perm…"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Mức độ hư tổn</label>
          <Input
            value={form.hairDamageLevel}
            onChange={(e) => updateField("hairDamageLevel", e.target.value)}
            placeholder="Low / Medium / High"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ghi chú của Stylist</label>
          <Textarea
            value={form.stylistNote}
            onChange={(e) => updateField("stylistNote", e.target.value)}
            placeholder="Ghi chú thêm về tâm lý khách, lưu ý kỹ thuật…"
          />
        </div>

        <Button
          className="w-full py-3 text-base"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "⏳ AI đang phân tích…" : "🚀 Phân tích kỹ thuật bằng AI"}
        </Button>

        {error && <div className="text-red-600">{error}</div>}
      </div>

      {/* RESULT */}
      {data && <StylistCoachPanel data={data} />}
    </div>
  );
}

