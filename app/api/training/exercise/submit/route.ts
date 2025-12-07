// ============================================
// Training - Submit Exercise
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exerciseGradingPrompt } from "@/core/prompts/exerciseGradingPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { exerciseId, userId, answer } = await req.json();

    if (!exerciseId || !userId || !answer) {
      return NextResponse.json(
        { error: "exerciseId, userId, and answer are required" },
        { status: 400 }
      );
    }

    // Get exercise
    const exercise = await prisma.trainingExercise.findUnique({
      where: { id: exerciseId },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        trainingRole: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let score: number | null = null;
    let feedback: any = null;

    // Auto-grade based on exercise type
    if (exercise.type === "quiz" && exercise.answer) {
      // Multiple choice - auto grade
      const correctAnswers = exercise.answer as any;
      const studentAnswers = answer;
      
      if (Array.isArray(correctAnswers) && Array.isArray(studentAnswers)) {
        let correct = 0;
        for (let i = 0; i < correctAnswers.length; i++) {
          if (correctAnswers[i] === studentAnswers[i]) {
            correct++;
          }
        }
        score = Math.round((correct / correctAnswers.length) * 100);
      }
    } else if (
      exercise.type === "case_study" ||
      exercise.type === "roleplay" ||
      exercise.type === "practical"
    ) {
      // AI grading for case study, roleplay, practical
      try {
        const prompt = exerciseGradingPrompt(
          exercise.type,
          exercise.content,
          answer,
          user.trainingRole || user.role || "STYLIST"
        );

        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Bạn là AI Training Evaluator chuyên nghiệp. Chấm điểm chính xác, đưa ra feedback có giá trị. Trả về JSON hợp lệ.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
          response_format: { type: "json_object" },
        });

        const rawOutput = completion.choices[0]?.message?.content;

        if (rawOutput) {
          try {
            feedback = JSON.parse(rawOutput);
            score = feedback.score || null;
          } catch (parseError) {
            const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              feedback = JSON.parse(jsonMatch[0]);
              score = feedback.score || null;
            }
          }
        }
      } catch (aiError) {
        console.error("AI grading error:", aiError);
        // Continue without AI grade
      }
    }

    // Create submission
    const submission = await prisma.exerciseSubmission.create({
      data: {
        exerciseId,
        userId,
        answer,
        score,
        feedback: feedback || null,
      },
    });

    // Update training progress if score >= 70
    if (score !== null && score >= 70) {
      // Find or create progress for this lesson
      const lesson = exercise.lesson;
      if (lesson) {
        // Get user's level
        const userLevel = await prisma.trainingLevel.findFirst({
          where: {
            role: {
              name: user.trainingRole || "STYLIST",
            },
            level: user.currentLevel || 1,
          },
        });

        if (userLevel) {
          // Check if progress exists
          const existingProgress = await prisma.trainingProgress.findUnique({
            where: {
              userId_levelId_lessonId: {
                userId,
                levelId: userLevel.id,
                lessonId: lesson.id,
              },
            },
          });

          if (existingProgress) {
            // Update if new score is higher
            if (score > (existingProgress.score || 0)) {
              await prisma.trainingProgress.update({
                where: { id: existingProgress.id },
                data: {
                  status: "completed",
                  score,
                  completedAt: new Date(),
                },
              });
            }
          } else {
            // Create new
            await prisma.trainingProgress.create({
              data: {
                userId,
                levelId: userLevel.id,
                lessonId: lesson.id,
                moduleId: lesson.moduleId,
                status: "completed",
                score,
                completedAt: new Date(),
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      submission,
      score,
      feedback,
    });
  } catch (err: any) {
    console.error("Submit exercise error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to submit exercise",
      },
      { status: 500 }
    );
  }
}

