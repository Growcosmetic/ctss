// ============================================
// Training - Initialize Example Exercises
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Create example exercises for demonstration
 */
export async function POST(req: Request) {
  try {
    // Get a sample lesson (first lesson from first module)
    const firstModule = await prisma.trainingModule.findFirst({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    });

    if (!firstModule || firstModule.lessons.length === 0) {
      return NextResponse.json(
        {
          error: "No lessons found. Please initialize training library first.",
        },
        { status: 400 }
      );
    }

    const lesson = firstModule.lessons[0];

    // Check if exercises already exist
    const existing = await prisma.trainingExercise.count({
      where: { lessonId: lesson.id },
    });

    if (existing > 0) {
      return NextResponse.json({
        success: true,
        message: "Example exercises already exist",
        skipped: true,
      });
    }

    const examples = [
      // Quiz Example
      {
        lessonId: lesson.id,
        type: "quiz",
        title: "Quiz: Kiến thức cơ bản về tóc",
        content: {
          questions: [
            {
              id: 1,
              question: "Dấu hiệu tóc KHÔNG phù hợp để uốn nóng?",
              options: [
                "Tóc săn chắc",
                "Tóc đã tẩy 2 lần",
                "Tóc khoẻ tự nhiên",
                "Tóc nhuộm nâu đen",
              ],
              correctAnswer: 1, // Index of correct option
            },
            {
              id: 2,
              question: "Thời gian test curl lần 1 là?",
              options: ["3 phút", "5 phút", "10 phút", "Tuỳ chất tóc"],
              correctAnswer: 1,
            },
            {
              id: 3,
              question: "Dấu hiệu lỗi uốn nóng phổ biến?",
              options: [
                "Cháy tóc phần đuôi",
                "Mềm hoá không đủ",
                "Ống quá to",
                "Tất cả",
              ],
              correctAnswer: 3,
            },
          ],
        },
        answer: [1, 1, 3], // Correct answers array
        points: 30,
      },

      // Case Study Example
      {
        lessonId: lesson.id,
        type: "case_study",
        title: "Case Study: Tư vấn khách uốn",
        content: {
          scenario:
            "Khách có tóc từng uốn 2 lần, nhuộm 3 lần trong 1 năm. Tóc khô – xốp – giãn nhẹ. Khách muốn uốn sóng lơi Hàn Quốc.",
          questions: [
            "Có nên uốn không?",
            "Quy trình kỹ thuật phù hợp?",
            "Rủi ro?",
            "Cần phục hồi trước hay sau?",
            "Cách tư vấn cho khách?",
          ],
        },
        answer: null, // AI will grade
        points: 50,
      },

      // Practical Task Example
      {
        lessonId: lesson.id,
        type: "practical",
        title: "Thực hành: Test curl",
        content: {
          task: "Thực hành test curl với 3 loại tóc khác nhau",
          requirements: [
            "Chọn 3 loại tóc (khoẻ, yếu, đã qua xử lý)",
            "Test curl với thời gian 3, 5, 7 phút",
            "Ghi chú kết quả",
            "Chụp ảnh minh chứng",
          ],
          evaluation: "Giảng viên sẽ đánh giá thực tế",
        },
        answer: null,
        points: 40,
      },

      // Roleplay Example
      {
        lessonId: lesson.id,
        type: "roleplay",
        title: "Roleplay: Khách khó tính",
        content: {
          scenario: "Khách khó tính - Muốn giá rẻ, kỹ, đòi hỏi nhiều",
          persona:
            "Khách hàng 35 tuổi, lần đầu đến salon, rất kỹ tính, muốn giá rẻ nhưng đòi hỏi chất lượng cao",
          initialMessage:
            "Chị muốn uốn tóc nhưng không muốn tốn kém quá. Chị muốn giá rẻ nhất nhưng phải đẹp nha em.",
          evaluationCriteria: [
            "Tone giao tiếp",
            "Đúng SOP",
            "Kiến thức kỹ thuật",
            "Xử lý rủi ro",
            "Upsale tinh tế",
          ],
        },
        answer: null,
        points: 50,
      },
    ];

    const created = await prisma.trainingExercise.createMany({
      data: examples,
    });

    return NextResponse.json({
      success: true,
      created: created.count,
      message: `Created ${created.count} example exercises`,
    });
  } catch (err: any) {
    console.error("Init example exercises error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to initialize example exercises",
      },
      { status: 500 }
    );
  }
}

