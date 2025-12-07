"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useParams, useRouter } from "next/navigation";

export default function ExercisePage() {
  const params = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answer, setAnswer] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    loadExercise();
    loadMySubmission();
  }, [params.id]);

  const loadExercise = async () => {
    try {
      const res = await fetch(
        `/api/training/exercise/list?exerciseId=${params.id}`
      );
      const data = await res.json();
      if (data.success && data.exercises.length > 0) {
        setExercise(data.exercises[0]);
      }
    } catch (err) {
      console.error("Load exercise error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMySubmission = async () => {
    try {
      // Get current user ID (in production, get from auth)
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch(
        `/api/training/exercise/submissions?exerciseId=${params.id}&userId=${userId}`
      );
      const data = await res.json();
      if (data.success && data.submissions.length > 0) {
        setSubmission(data.submissions[0]);
        setAnswer(data.submissions[0].answer);
      }
    } catch (err) {
      console.error("Load submission error:", err);
    }
  };

  const handleSubmit = async () => {
    if (!answer) {
      alert("Vui lòng hoàn thành bài tập trước khi nộp");
      return;
    }

    setSubmitting(true);
    try {
      // Get current user ID (in production, get from auth)
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Vui lòng đăng nhập");
        return;
      }

      const res = await fetch("/api/training/exercise/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: params.id,
          userId,
          answer,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmission(data.submission);
        alert(`Đã nộp bài! Điểm: ${data.score || "Đang chấm..."}`);
      } else {
        alert("Có lỗi: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Submit exercise error:", err);
      alert("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const renderExerciseContent = () => {
    if (!exercise) return null;

    const content = exercise.content as any;

    switch (exercise.type) {
      case "quiz":
        return (
          <div className="space-y-4">
            {content.questions?.map((q: any, idx: number) => (
              <Card key={q.id} className="p-4 border">
                <div className="font-semibold mb-3">
                  Câu {idx + 1}: {q.question}
                </div>
                <div className="space-y-2">
                  {q.options.map((opt: string, optIdx: number) => (
                    <label
                      key={optIdx}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={optIdx}
                        checked={
                          Array.isArray(answer) && answer[idx] === optIdx
                        }
                        onChange={() => {
                          const newAnswer = [...(answer || [])];
                          newAnswer[idx] = optIdx;
                          setAnswer(newAnswer);
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        );

      case "case_study":
        return (
          <div className="space-y-4">
            <Card className="p-4 border bg-blue-50">
              <div className="font-semibold text-blue-900 mb-2">
                📋 Tình huống:
              </div>
              <div className="text-gray-700">{content.scenario}</div>
            </Card>
            <Card className="p-4 border">
              <div className="font-semibold mb-3">Yêu cầu trả lời:</div>
              <div className="space-y-3">
                {content.questions?.map((q: string, idx: number) => (
                  <div key={idx}>
                    <div className="font-medium mb-1">{idx + 1}. {q}</div>
                    <textarea
                      value={
                        (answer && answer[idx]) || ""
                      }
                      onChange={(e) => {
                        const newAnswer = [...(answer || [])];
                        newAnswer[idx] = e.target.value;
                        setAnswer(newAnswer);
                      }}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                      rows={3}
                      placeholder="Nhập câu trả lời..."
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case "practical":
        return (
          <div className="space-y-4">
            <Card className="p-4 border">
              <div className="font-semibold mb-3">📝 Nhiệm vụ:</div>
              <div className="text-gray-700 mb-4">{content.task}</div>
              <div className="font-semibold mb-2">Yêu cầu:</div>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {content.requirements?.map((req: string, idx: number) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-4 border">
              <div className="font-semibold mb-2">📤 Nộp bài:</div>
              <textarea
                value={answer || ""}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={5}
                placeholder="Mô tả kết quả thực hành, upload ảnh (URL), ghi chú..."
              />
            </Card>
          </div>
        );

      case "roleplay":
        return (
          <div className="space-y-4">
            <Card className="p-4 border bg-purple-50">
              <div className="font-semibold text-purple-900 mb-2">
                🎭 Kịch bản:
              </div>
              <div className="text-gray-700 mb-3">{content.scenario}</div>
              <div className="font-semibold mb-2">Persona khách:</div>
              <div className="text-gray-700">{content.persona}</div>
            </Card>
            <Card className="p-4 border">
              <div className="font-semibold mb-2">💬 Khách nói:</div>
              <div className="p-3 bg-gray-100 rounded-lg mb-4">
                {content.initialMessage}
              </div>
              <div className="font-semibold mb-2">Bạn trả lời:</div>
              <textarea
                value={answer || ""}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={5}
                placeholder="Nhập câu trả lời của bạn..."
              />
            </Card>
          </div>
        );

      default:
        return (
          <div className="p-4 border rounded-lg">
            <div className="text-gray-700 whitespace-pre-line">
              {JSON.stringify(content, null, 2)}
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12 text-red-600">
          Không tìm thấy bài tập
        </div>
      </div>
    );
  }

  const typeNames: Record<string, string> = {
    quiz: "📝 Quiz",
    case_study: "📋 Case Study",
    practical: "🔧 Bài thực hành",
    roleplay: "🎭 Roleplay Practice",
    video_voice: "🎥 Video/Voice",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          ← Quay lại
        </Button>
        <h1 className="text-3xl font-bold mb-2">{exercise.title}</h1>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {typeNames[exercise.type] || exercise.type}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {exercise.points} điểm
          </span>
          {exercise.lesson?.module && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {exercise.lesson.module.title}
            </span>
          )}
        </div>
      </div>

      {/* Exercise Content */}
      <Card className="p-6 border">{renderExerciseContent()}</Card>

      {/* Submission Result */}
      {submission && (
        <Card className="p-6 border bg-green-50">
          <div className="font-semibold text-green-900 mb-3">
            ✅ Kết quả bài làm
          </div>
          {submission.score !== null && (
            <div className="text-2xl font-bold text-green-700 mb-3">
              Điểm: {submission.score}/100
            </div>
          )}
          {submission.feedback && (
            <div className="space-y-3">
              {submission.feedback.feedback && (
                <div>
                  <div className="font-medium mb-1">Nhận xét:</div>
                  <div className="text-gray-700">
                    {submission.feedback.feedback}
                  </div>
                </div>
              )}
              {submission.feedback.strengths &&
                submission.feedback.strengths.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Điểm mạnh:</div>
                    <ul className="list-disc list-inside text-gray-700">
                      {submission.feedback.strengths.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              {submission.feedback.improvements &&
                submission.feedback.improvements.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Cần cải thiện:</div>
                    <ul className="list-disc list-inside text-gray-700">
                      {submission.feedback.improvements.map(
                        (i: string, idx: number) => (
                          <li key={idx}>{i}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </Card>
      )}

      {/* Submit Button */}
      {!submission && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !answer}
            className="bg-blue-600"
          >
            {submitting ? "⏳ Đang nộp..." : "📤 Nộp bài"}
          </Button>
        </div>
      )}
    </div>
  );
}

