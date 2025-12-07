// ============================================
// Training Quiz - Generate Quiz
// ============================================

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { quizPrompt } from "@/core/prompts/quizPrompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lessonId, questionCount, difficulty } = body;

    // Validation
    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    // Check if lesson exists
    const lesson = await prisma.trainingLesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Check if quiz already exists
    const existingQuiz = await prisma.trainingQuiz.findUnique({
      where: { lessonId },
    });

    if (existingQuiz) {
      return NextResponse.json({
        success: true,
        quiz: existingQuiz,
        message: "Quiz already exists for this lesson",
      });
    }

    // Generate quiz using AI
    if (!lesson.content) {
      return NextResponse.json(
        { error: "Lesson content is empty" },
        { status: 400 }
      );
    }

    const prompt = quizPrompt({
      lessonContent: lesson.content,
      questionCount: questionCount || 5,
      difficulty: difficulty || "medium",
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chuyên tạo bài kiểm tra stylist. Tạo câu hỏi trắc nghiệm chất lượng cao, rõ ràng, thực tế. Trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return any content");
    }

    // Parse JSON
    let quizData;
    try {
      quizData = JSON.parse(rawOutput);
    } catch (parseError) {
      // Try to extract JSON from markdown if present
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    // Validate structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid quiz structure: missing questions array");
    }

    // Validate each question
    for (const q of quizData.questions) {
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error("Invalid question structure: missing required fields");
      }
      if (q.correctIndex === undefined || q.correctIndex < 0 || q.correctIndex > 3) {
        throw new Error("Invalid correctIndex: must be 0, 1, 2, or 3");
      }
    }

    // Save quiz to database
    const savedQuiz = await prisma.trainingQuiz.create({
      data: {
        lessonId,
        questions: quizData.questions,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      quiz: savedQuiz,
      message: "Quiz generated successfully",
    });
  } catch (err: any) {
    console.error("Generate quiz error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate quiz",
      },
      { status: 500 }
    );
  }
}

