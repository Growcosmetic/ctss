// ============================================
// Training Lesson - Generate Lesson (AI)
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { prisma } from "@/lib/prisma";
import { trainingLessonPrompt } from "@/core/prompts/trainingLessonPrompt";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { moduleId, topic, order, level, focus } = body;

    // Validation
    if (!moduleId || !topic) {
      return NextResponse.json(
        { error: "moduleId and topic are required" },
        { status: 400 }
      );
    }

    // Verify module exists
    const module = await prisma.trainingModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // If order not provided, get next order in module
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxOrder = await prisma.trainingLesson.findFirst({
        where: { moduleId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      finalOrder = (maxOrder?.order || 0) + 1;
    }

    // Generate lesson content using AI
    const prompt = trainingLessonPrompt({
      topic,
      module: module.title,
      level: level || "beginner",
      focus,
    });

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia đào tạo stylist cấp master. Tạo bài học kỹ thuật chuyên nghiệp, chính xác, dễ hiểu. Trả về JSON hợp lệ.",
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

    if (!rawOutput) {
      throw new Error("AI did not return any content");
    }

    // Parse JSON
    let lessonContent;
    try {
      lessonContent = JSON.parse(rawOutput);
    } catch (parseError) {
      // Try to extract JSON from markdown if present
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lessonContent = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: use raw output as text
        lessonContent = {
          title: topic,
          text: rawOutput.trim(),
          keyPoints: [],
          mistakes: [],
          fixes: [],
          duration: "20m",
        };
      }
    }

    // Validate required fields
    if (!lessonContent.title) {
      lessonContent.title = topic;
    }
    if (!lessonContent.text) {
      lessonContent.text = "Nội dung bài học đang được cập nhật...";
    }

    // Save lesson to database
    const savedLesson = await prisma.trainingLesson.create({
      data: {
        moduleId,
        title: lessonContent.title,
        content: lessonContent,
        order: finalOrder,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      lesson: savedLesson,
      message: "Lesson generated and saved successfully",
    });
  } catch (err: any) {
    console.error("Generate lesson error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate lesson",
      },
      { status: 500 }
    );
  }
}

