// ============================================
// Training - Promote Staff (Auto or Manual)
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getPromotionCriteria } from "@/core/certification/promotionCriteria";
import { certificationPrompt } from "@/core/prompts/certificationPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { staffId, autoPromote } = await req.json();

    if (!staffId) {
      return NextResponse.json(
        { error: "staffId is required" },
        { status: 400 }
      );
    }

    // Get staff info
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        name: true,
        trainingRole: true,
        currentLevel: true,
      },
    });

    if (!staff || !staff.trainingRole || !staff.currentLevel) {
      return NextResponse.json(
        { error: "Staff not found or missing training info" },
        { status: 404 }
      );
    }

    // Check if already at max level
    if (staff.currentLevel >= 4) {
      return NextResponse.json({
        success: false,
        error: "Đã đạt level cao nhất",
      });
    }

    // Get promotion criteria
    const criteria = getPromotionCriteria(
      staff.trainingRole,
      staff.currentLevel
    );

    if (!criteria) {
      return NextResponse.json({
        success: false,
        error: "Không tìm thấy tiêu chí thăng cấp",
      });
    }

    // If auto-promote, check eligibility first (simplified check)
    if (autoPromote) {
      // Quick eligibility check - in production, use the full check-promotion endpoint
      const assessments = await prisma.skillAssessment.findMany({
        where: { staffId },
        orderBy: { createdAt: "desc" },
        take: 1,
      });

      const roleplays = await prisma.roleplaySession.findMany({
        where: {
          userId: staffId,
          status: "completed",
          score: { not: null },
        },
      });

      const progress = await prisma.trainingProgress.findMany({
        where: { userId: staffId, status: "completed" },
      });

      const totalModules = await prisma.trainingModule.count({
        where: { role: staff.trainingRole },
      });

      const moduleCompletionRate =
        totalModules > 0
          ? Math.round((progress.length / totalModules) * 100)
          : 0;

      const averageRoleplayScore =
        roleplays.length > 0
          ? Math.round(
              roleplays.reduce((sum, r) => sum + (r.score || 0), 0) /
                roleplays.length
            )
          : 0;

      const latestAssessment = assessments[0];
      const minSkillScore = latestAssessment
        ? Math.min(
            latestAssessment.communication,
            latestAssessment.technical,
            latestAssessment.problemSolving,
            latestAssessment.customerExperience,
            latestAssessment.upsale
          )
        : 0;

      // Basic eligibility check
      if (
        moduleCompletionRate < criteria.requirements.moduleCompletionRate ||
        averageRoleplayScore < criteria.requirements.averageRoleplayScore ||
        roleplays.length < criteria.requirements.minRoleplayCount ||
        minSkillScore < criteria.requirements.minSkillScore
      ) {
        return NextResponse.json({
          success: false,
          error: "Chưa đủ điều kiện thăng cấp",
        });
      }
    }

    // Get next level
    const nextLevel = await prisma.trainingLevel.findFirst({
      where: {
        role: {
          name: staff.trainingRole,
        },
        level: criteria.level,
      },
    });

    if (!nextLevel) {
      return NextResponse.json({
        success: false,
        error: "Level không tồn tại",
      });
    }

    // Get average score
    const assessments = await prisma.skillAssessment.findMany({
      where: { staffId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const averageScore =
      assessments.length > 0
        ? Math.round(
            assessments.reduce((sum, a) => sum + a.totalScore, 0) /
              assessments.length
          )
        : 0;

    // Generate certificate content (AI)
    let certificateContent = null;
    try {
      const prompt = certificationPrompt(
        staff.name,
        criteria.name,
        staff.trainingRole,
        averageScore,
        new Date().toLocaleDateString("vi-VN")
      );

      const completion = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là AI Certificate Generator chuyên nghiệp. Tạo nội dung chứng chỉ sang trọng, trang trọng. Trả về JSON hợp lệ.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const rawOutput = completion.choices[0]?.message?.content;
      if (rawOutput) {
        try {
          certificateContent = JSON.parse(rawOutput);
        } catch {
          const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            certificateContent = JSON.parse(jsonMatch[0]);
          }
        }
      }
    } catch (err) {
      console.error("Certificate generation error:", err);
      // Continue without AI content
    }

    // Create certification
    const certification = await prisma.certification.create({
      data: {
        userId: staffId,
        levelId: nextLevel.id,
        role: staff.trainingRole,
        level: criteria.level,
        metadata: {
          averageScore,
          certificateContent,
          promotedAt: new Date().toISOString(),
          autoPromote: autoPromote || false,
        },
      },
    });

    // Update staff level
    await prisma.user.update({
      where: { id: staffId },
      data: {
        currentLevel: criteria.level,
      },
    });

    // Create notification (placeholder - would integrate with notification system)
    // await prisma.notification.create({...});

    return NextResponse.json({
      success: true,
      certification,
      newLevel: criteria.level,
      levelName: criteria.name,
      message: `Chúc mừng! ${staff.name} đã được thăng cấp lên ${criteria.name}`,
    });
  } catch (err: any) {
    console.error("Promote error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to promote staff",
      },
      { status: 500 }
    );
  }
}

