"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CUSTOMER_TYPES = [
  {
    id: "khach_kho_tinh",
    name: "Khách khó tính",
    description: "Hỏi giá liên tục, soi mói kỹ thuật, dễ nổi nóng",
    icon: "😠",
  },
  {
    id: "khach_gap",
    name: "Khách gấp",
    description: "Muốn làm ngay, test khả năng xử lý lịch",
    icon: "⏰",
  },
  {
    id: "khach_chua_ro_nhu_cau",
    name: "Khách chưa rõ nhu cầu",
    description: "Không biết làm gì, cần tư vấn",
    icon: "🤔",
  },
  {
    id: "khach_so_hu_toc",
    name: "Khách sợ hư tóc",
    description: "Lo lắng tóc sẽ cháy/yếu",
    icon: "😰",
  },
  {
    id: "khach_muon_re",
    name: "Khách muốn rẻ",
    description: "Hỏi giá liên tục, muốn giảm giá",
    icon: "💰",
  },
  {
    id: "khach_phan_nan",
    name: "Khách phàn nàn",
    description: "Tóc làm xong không ưng ý",
    icon: "😞",
  },
];

const ROLES = [
  { id: "RECEPTIONIST", name: "Lễ tân" },
  { id: "STYLIST", name: "Stylist" },
  { id: "CSKH_ONLINE", name: "CSKH Online" },
];

export default function RoleplayPage() {
  const [selectedCustomerType, setSelectedCustomerType] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("STYLIST");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const startSession = async () => {
    if (!selectedCustomerType || !selectedRole) {
      alert("Vui lòng chọn loại khách và vai trò");
      return;
    }

    setLoading(true);
    try {
      // Get current user ID (in production, get from auth)
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Vui lòng đăng nhập");
        return;
      }

      const res = await fetch("/api/training/roleplay/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          customerType: selectedCustomerType,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSession(data.session);
      } else {
        alert("Có lỗi: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Start session error:", err);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !session) return;

    setSending(true);
    try {
      const res = await fetch("/api/training/roleplay/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          staffMessage: message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSession(data.session);
        setMessage("");
        if (!data.shouldContinue) {
          // Session ended, evaluate
          await evaluateSession(session.id);
        }
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const evaluateSession = async (sessionId: string) => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/training/roleplay/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (data.success) {
        setEvaluation(data.evaluation);
        setSession(data.session);
      }
    } catch (err) {
      console.error("Evaluate error:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const messages = session?.messages || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🎭 AI Roleplay Simulator</h1>
        <p className="text-gray-600">
          Thực hành giao tiếp với AI đóng vai khách hàng thật
        </p>
      </div>

      {!session ? (
        // Selection Screen
        <div className="space-y-6">
          {/* Role Selection */}
          <Card className="p-6 border">
            <h2 className="text-xl font-semibold mb-4">Vai trò của bạn:</h2>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-lg border ${
                    selectedRole === role.id
                      ? "bg-blue-100 border-blue-500"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Customer Type Selection */}
          <Card className="p-6 border">
            <h2 className="text-xl font-semibold mb-4">
              Chọn loại khách hàng để luyện tập:
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CUSTOMER_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedCustomerType(type.id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    selectedCustomerType === type.id
                      ? "bg-purple-100 border-purple-500 shadow-md"
                      : "bg-white hover:shadow-md"
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-semibold mb-1">{type.name}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Start Button */}
          <div className="flex justify-center">
            <Button
              onClick={startSession}
              disabled={loading || !selectedCustomerType}
              className="bg-purple-600 text-lg px-8 py-3"
            >
              {loading ? "⏳ Đang tạo session..." : "🚀 Bắt đầu Roleplay"}
            </Button>
          </div>
        </div>
      ) : (
        // Chat Interface
        <div className="space-y-6">
          {/* Scenario Info */}
          <Card className="p-4 border bg-blue-50">
            <div className="font-semibold text-blue-900 mb-2">📋 Tình huống:</div>
            <div className="text-sm text-gray-700">{session.scenario}</div>
            <div className="font-semibold text-blue-900 mt-3 mb-2">👤 Khách hàng:</div>
            <div className="text-sm text-gray-700">{session.persona}</div>
          </Card>

          {/* Chat Messages */}
          <Card className="p-6 border" style={{ minHeight: "400px" }}>
            <div className="space-y-4 mb-4">
              {messages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "staff" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "staff"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {msg.role === "staff" ? "Bạn" : "Khách hàng"}
                    </div>
                    <div>{msg.message}</div>
                    {msg.emotion && (
                      <div className="text-xs text-gray-500 mt-1">
                        😊 {msg.emotion}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {evaluating && (
              <div className="text-center py-8 text-gray-500">
                ⏳ AI đang chấm điểm...
              </div>
            )}
          </Card>

          {/* Evaluation Result */}
          {evaluation && (
            <Card className="p-6 border bg-green-50">
              <div className="font-semibold text-green-900 mb-3 text-xl">
                ✅ Kết quả đánh giá
              </div>
              <div className="text-3xl font-bold text-green-700 mb-4">
                Điểm: {session.score}/100
              </div>

              {evaluation.assessment && (
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(evaluation.assessment).map(
                      ([key, value]: [string, any]) => (
                        <div
                          key={key}
                          className="p-3 bg-white rounded-lg border"
                        >
                          <div className="text-xs text-gray-600 mb-1">
                            {key === "communication"
                              ? "Giao tiếp"
                              : key === "technicalUnderstanding"
                              ? "Kỹ thuật"
                              : key === "problemSolving"
                              ? "Xử lý"
                              : key === "upsale"
                              ? "Upsale"
                              : key === "customerExperience"
                              ? "Trải nghiệm"
                              : key}
                          </div>
                          <div className="text-lg font-bold">
                            {value?.score || 0}/20
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {evaluation.feedback && (
                <div className="mb-3">
                  <div className="font-medium mb-1">Nhận xét:</div>
                  <div className="text-gray-700">{evaluation.feedback}</div>
                </div>
              )}

              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="mb-3">
                  <div className="font-medium mb-1">Điểm mạnh:</div>
                  <ul className="list-disc list-inside text-gray-700">
                    {evaluation.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.improvements &&
                evaluation.improvements.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Cần cải thiện:</div>
                    <ul className="list-disc list-inside text-gray-700">
                      {evaluation.improvements.map((i: string, idx: number) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </Card>
          )}

          {/* Input */}
          {session.status === "active" && !evaluating && (
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Nhập câu trả lời của bạn..."
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <Button
                onClick={sendMessage}
                disabled={sending || !message.trim()}
                className="bg-purple-600"
              >
                {sending ? "⏳" : "📤 Gửi"}
              </Button>
              <Button
                onClick={() => evaluateSession(session.id)}
                variant="outline"
              >
                ✅ Kết thúc & Chấm điểm
              </Button>
            </div>
          )}

          {/* New Session Button */}
          {session.status === "completed" && (
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setSession(null);
                  setEvaluation(null);
                  setSelectedCustomerType("");
                }}
                className="bg-purple-600"
              >
                🎭 Bắt đầu Roleplay Mới
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

