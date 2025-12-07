// ============================================
// Training Quiz - Submit Quiz & Auto-Grade
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveSkillProgress, computeSkillScoresFromQuiz } from "@/core/scoring/addSkillProgress";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId, answers, userId } = body;

    // Validation
    if (!quizId || !answers || !userId) {
      return NextResponse.json(
        { error: "quizId, answers, and userId are required" },
        { status: 400 }
      );
    }

    // Verify quiz exists
    const quiz = await prisma.trainingQuiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const questions = quiz.questions as any[];

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid quiz questions format" },
        { status: 500 }
      );
    }

    // Validate answers array length
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return NextResponse.json(
        { error: `Answers array length must be ${questions.length}` },
        { status: 400 }
      );
    }

    // Auto-grade
    let score = 0;
    const results = questions.map((q: any, i: number) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) score++;
      return {
        questionIndex: i,
        question: q.question,
        userAnswer: answers[i],
        correctAnswer: q.correctIndex,
        isCorrect,
        explanation: q.explanation || "",
      };
    });

    // Calculate percentage
    const percentage = Math.round((score / questions.length) * 100);

    // Save result to database
    const savedResult = await prisma.trainingQuizResult.create({
      data: {
        quizId,
        userId,
        answers,
        score,
        total: questions.length,
      },
      include: {
        quiz: {
          select: {
            id: true,
            lesson: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Save skill progress from quiz
    const skillScores = computeSkillScoresFromQuiz(score, questions.length);
    await saveSkillProgress(userId, skillScores, "quiz", quizId);

    return NextResponse.json({
      success: true,
      result: {
        id: savedResult.id,
        score,
        total: questions.length,
        percentage,
        passed: percentage >= 70, // 70% passing score
      },
      details: results,
      questions: questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    });
  } catch (err: any) {
    console.error("Submit quiz error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to submit quiz",
      },
      { status: 500 }
    );
  }
}

