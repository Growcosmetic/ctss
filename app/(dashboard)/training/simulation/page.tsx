"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function SimulationPage() {
  const [session, setSession] = useState<any>(null);
  const [scenario, setScenario] = useState("");
  const [persona, setPersona] = useState("khách dễ thương");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const personaOptions = [
    { value: "khách dễ thương", label: "Khách dễ thương" },
    { value: "khách khó tính", label: "Khách khó tính" },
    { value: "khách chậm hiểu", label: "Khách chậm hiểu" },
    { value: "khách VIP sang", label: "Khách VIP sang" },
    { value: "khách thiếu kiên nhẫn", label: "Khách thiếu kiên nhẫn" },
    { value: "khách ít nói", label: "Khách ít nói" },
  ];

  const scenarioExamples = [
    "Tóc hư tổn sau tẩy, khách muốn uốn nhưng lo sợ",
    "Khách muốn nhuộm màu mới nhưng không biết màu nào phù hợp",
    "Tóc xoăn tự nhiên, khách muốn duỗi thẳng",
    "Khách có tóc mỏng, muốn làm dày và có độ phồng",
    "Khách muốn tóc layer kiểu Hàn nhưng sợ bị hỏng",
  ];

  const start = async () => {
    if (!scenario.trim()) {
      setError("Vui lòng nhập tình huống");
      return;
    }

    setLoading(true);
    setError(null);
    setChat([]);
    setEvaluation(null);

    try {
      // TODO: Get actual userId from auth context
      const userId = "stylist_01"; // Placeholder

      const res = await fetch("/api/training/simulation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          scenario: scenario.trim(),
          persona: persona.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start simulation");
      }

      setSession(data.session);
      setChat([
        {
          role: "assistant",
          content: data.initialMessage,
        },
      ]);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    const userMessage = message.trim();
    setMessage("");

    // Optimistic update
    setChat((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const res = await fetch("/api/training/simulation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          message: userMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message");
      }

      // Add AI reply
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);

      // Update evaluation if available
      if (data.evaluation) {
        setEvaluation(data.evaluation);
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
      // Remove optimistic update on error
      setChat((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const res = await fetch("/api/training/simulation/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });

      const data = await res.json();

      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        setSession({ ...session, status: "completed" });
      }
    } catch (err: any) {
      setError(err.message || "Failed to end session");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSession(null);
    setChat([]);
    setEvaluation(null);
    setScenario("");
    setMessage("");
    setError(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🎭 AI Stylist Simulation</h1>
        <p className="text-gray-600">
          Luyện tập tư vấn với AI mô phỏng khách hàng thật
        </p>
      </div>

      {!session && (
        <Card className="p-6 border space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Tình huống *
            </label>
            <Input
              placeholder="Ví dụ: Tóc hư tổn sau tẩy, khách muốn uốn nhưng lo sợ"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="mb-2"
            />
            <div className="text-xs text-gray-500 mb-4">
              Gợi ý:
              {scenarioExamples.slice(0, 3).map((ex, i) => (
                <div key={i} className="mt-1">
                  • {ex}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Tính cách khách hàng
            </label>
            <Select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            >
              {personaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={start}
            disabled={loading || !scenario.trim()}
            className="w-full py-3 text-base"
          >
            {loading ? "⏳ Đang khởi tạo..." : "🎬 Bắt đầu mô phỏng"}
          </Button>
        </Card>
      )}

      {session && (
        <div className="space-y-6">
          <Card className="p-4 border bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <strong>Tình huống:</strong> {session.scenario}
                <br />
                <strong>Tính cách:</strong> {session.persona}
              </div>
              {session.status === "active" && (
                <Button onClick={endSession} variant="outline" size="sm">
                  Kết thúc phiên
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6 border space-y-4" style={{ minHeight: "400px" }}>
            {/* CHAT MESSAGES */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {m.role === "user" ? "Bạn (Stylist)" : "Khách hàng"}
                    </div>
                    <div className="whitespace-pre-line">{m.content}</div>
                  </div>
                </div>
              ))}
              {loading && chat.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT */}
            {session.status === "active" && (
              <div className="flex gap-3 pt-4 border-t">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Trả lời khách hàng..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  onClick={send}
                  disabled={loading || !message.trim()}
                  className="px-6"
                >
                  Gửi
                </Button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
          </Card>

          {/* EVALUATION */}
          {evaluation && (
            <Card className="p-6 border bg-gradient-to-br from-indigo-50 to-purple-50">
              <h2 className="text-xl font-semibold mb-4">
                📊 Đánh giá kỹ năng
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {Object.entries(evaluation.scores || {}).map(([key, value]: any) => {
                  const labels: Record<string, string> = {
                    questioning: "Đặt câu hỏi",
                    analysis: "Phân tích",
                    suggestion: "Gợi ý",
                    emotion: "Xử lý cảm xúc",
                    closing: "Chốt dịch vụ",
                  };

                  const colorClass =
                    value >= 8
                      ? "bg-green-100 text-green-700"
                      : value >= 6
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700";

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border text-center ${colorClass}`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {labels[key] || key}
                      </div>
                      <div className="text-2xl font-bold">{value}/10</div>
                    </div>
                  );
                })}
              </div>

              <div className="mb-4">
                <div className="text-lg font-semibold mb-2">
                  Tổng điểm: {evaluation.overallScore || 0}/100
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {evaluation.feedback}
                </div>
              </div>

              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="mb-4">
                  <div className="font-semibold text-green-700 mb-2">
                    ✅ Điểm mạnh:
                  </div>
                  <ul className="list-disc ml-6 text-sm text-gray-700">
                    {evaluation.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.improvements &&
                evaluation.improvements.length > 0 && (
                  <div>
                    <div className="font-semibold text-orange-700 mb-2">
                      💡 Cần cải thiện:
                    </div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {evaluation.improvements.map((i: string, idx: number) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </Card>
          )}

          {session.status === "completed" && (
            <div className="text-center">
              <Button onClick={reset} variant="outline">
                Tạo phiên mới
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

