"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function QuizPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/training/quiz/get?id=${quizId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load quiz");
      }

      setQuiz(data.quiz);
      const questions = data.quiz.questions as any[];
      setAnswers(new Array(questions.length).fill(null));
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      load();
    }
  }, [quizId]);

  const submit = async () => {
    // Check if all questions are answered
    if (answers.some((a) => a === null)) {
      setError("Vui lòng trả lời tất cả các câu hỏi");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // TODO: Get actual userId from auth context
      const userId = "stylist_1"; // Placeholder

      const res = await fetch("/api/training/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit quiz");
      }

      setResult(data);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải bài kiểm tra…</div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-6 border bg-red-50">
          <div className="text-red-600 mb-4">Lỗi: {error}</div>
          <Button onClick={load}>Thử lại</Button>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">Không tìm thấy bài kiểm tra</div>
      </div>
    );
  }

  const questions = quiz.questions as any[];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          📘 Bài kiểm tra: {quiz.lesson?.title}
        </h1>
        <p className="text-gray-600">
          Module: {quiz.lesson?.module?.title}
        </p>
        {!submitted && (
          <p className="text-sm text-gray-500 mt-1">
            {questions.length} câu hỏi • Hãy chọn đáp án đúng cho mỗi câu
          </p>
        )}
      </div>

      {error && !submitted && (
        <Card className="p-4 border bg-red-50">
          <div className="text-red-600 text-sm">{error}</div>
        </Card>
      )}

      {!submitted && (
        <div className="space-y-4">
          {questions.map((q: any, i: number) => (
            <Card
              key={i}
              className="p-6 border bg-white hover:shadow-md transition-shadow"
            >
              <div className="font-semibold text-gray-900 mb-4">
                Câu {i + 1}: {q.question}
              </div>

              <div className="space-y-3">
                {q.options.map((opt: string, idx: number) => {
                  const optionLabels = ["A", "B", "C", "D"];
                  const isSelected = answers[i] === idx;

                  return (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300"
                          : "bg-gray-50 border-gray-200 hover:border-indigo-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q${i}`}
                        checked={isSelected}
                        onChange={() => {
                          const newAns = [...answers];
                          newAns[i] = idx;
                          setAnswers(newAns);
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-indigo-600 mr-2">
                          {optionLabels[idx]}.
                        </span>
                        <span className="text-gray-800">{opt}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              Đã trả lời: {answers.filter((a) => a !== null).length} /{" "}
              {questions.length}
            </div>
            <Button
              onClick={submit}
              disabled={submitting || answers.some((a) => a === null)}
              className="px-6 py-3 text-base"
            >
              {submitting ? "⏳ Đang nộp bài..." : "✅ Nộp bài"}
            </Button>
          </div>
        </div>
      )}

      {submitted && result && (
        <Card className="p-6 border bg-gradient-to-br from-indigo-50 to-blue-50">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {result.result.passed ? "🎉 Chúc mừng!" : "📚 Cần cố gắng thêm"}
            </h2>
            <div
              className={`text-4xl font-bold mb-2 ${
                result.result.passed ? "text-green-600" : "text-orange-600"
              }`}
            >
              {result.result.score}/{result.result.total}
            </div>
            <div className="text-lg text-gray-600">
              Tỷ lệ đúng: <strong>{result.result.percentage}%</strong>
            </div>
            {result.result.passed && (
              <div className="mt-2 text-green-600 font-semibold">
                ✅ Đạt yêu cầu (≥70%)
              </div>
            )}
            {!result.result.passed && (
              <div className="mt-2 text-orange-600 font-semibold">
                ⚠️ Chưa đạt yêu cầu. Cần ≥70% để pass
              </div>
            )}
          </div>

          <div className="space-y-4">
            {result.details.map((detail: any, i: number) => {
              const isCorrect = detail.isCorrect;
              const optionLabels = ["A", "B", "C", "D"];

              return (
                <Card
                  key={i}
                  className={`p-5 border ${
                    isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-semibold text-gray-900">
                      Câu {i + 1}: {detail.question}
                    </div>
                    {isCorrect ? (
                      <span className="text-green-600 font-bold">✓ Đúng</span>
                    ) : (
                      <span className="text-red-600 font-bold">✗ Sai</span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Đáp án của bạn:
                      </span>{" "}
                      <span
                        className={
                          isCorrect ? "text-green-700" : "text-red-700"
                        }
                      >
                        {optionLabels[detail.userAnswer]}.{" "}
                        {result.questions[i].options[detail.userAnswer]}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Đáp án đúng:
                        </span>{" "}
                        <span className="text-green-700 font-semibold">
                          {optionLabels[detail.correctAnswer]}.{" "}
                          {result.questions[i].options[detail.correctAnswer]}
                        </span>
                      </div>
                    )}

                    {detail.explanation && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <div className="font-medium text-indigo-700 mb-1">
                          💡 Giải thích:
                        </div>
                        <div className="text-gray-700 whitespace-pre-line">
                          {detail.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Button
              onClick={() => {
                setSubmitted(false);
                setAnswers(new Array(questions.length).fill(null));
                setResult(null);
              }}
              variant="outline"
            >
              Làm lại
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

