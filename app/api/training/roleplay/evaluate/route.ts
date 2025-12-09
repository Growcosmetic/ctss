// ============================================
// Training - Evaluate Roleplay Session
// ============================================

import { NextResponse } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { exerciseGradingPrompt } from "@/core/prompts/exerciseGradingPrompt";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Client initialized lazily via getClient()

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Get session
    const session = await prisma.roleplaySession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            trainingRole: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get all staff messages
    const messages = session.messages as any[];
    const staffMessages = messages
      .filter((m: any) => m.role === "staff")
      .map((m: any) => m.message);

    // AI Evaluation
    const prompt = exerciseGradingPrompt(
      "roleplay",
      {
        scenario: session.scenario,
        persona: session.persona,
        messages: messages,
      },
      {
        responses: staffMessages,
        finalMessage: staffMessages[staffMessages.length - 1] || "",
      },
      session.role
    );

    const completion = await getClient().chat.completions.create({
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
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;

    if (!rawOutput) {
      throw new Error("AI did not return evaluation");
    }

    let evaluation;
    try {
      evaluation = JSON.parse(rawOutput);
    } catch (parseError) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI evaluation");
      }
    }

    // Update session with score and evaluation
    const updatedSession = await prisma.roleplaySession.update({
      where: { id: sessionId },
      data: {
        score: evaluation.score || null,
        assessment: evaluation.assessment || null,
        feedback: evaluation,
        status: "completed",
      },
    });

    // Auto-create Skill Assessment (import function directly instead of fetch)
    try {
      const { skillAssessmentPrompt } = await import("@/core/prompts/skillAssessmentPrompt");
      const { calculateTotalScore, getSkillLevel } = await import("@/core/skills/scoreCalculator");
      
      // Use evaluation data to create assessment
      const assessment = evaluation.assessment || {};
      const skillScores = {
        communication: assessment.communication?.score || 0,
        technical: assessment.technicalUnderstanding?.score || 0,
        problemSolving: assessment.problemSolving?.score || 0,
        customerExperience: assessment.customerExperience?.score || 0,
        upsale: assessment.upsale?.score || 0,
      };

      const totalScore = calculateTotalScore(skillScores);
      const level = getSkillLevel(totalScore);

      await prisma.skillAssessment.create({
        data: {
          staffId: session.userId,
          source: "roleplay",
          sourceId: sessionId,
          scenarioType: session.scenario?.includes("khách khó tính")
            ? "khach_kho_tinh"
            : session.scenario?.includes("gấp")
            ? "khach_gap"
            : session.scenario?.includes("chưa rõ")
            ? "khach_chua_ro_nhu_cau"
            : session.scenario?.includes("sợ hư")
            ? "khach_so_hu_toc"
            : session.scenario?.includes("rẻ")
            ? "khach_muon_re"
            : session.scenario?.includes("phàn nàn")
            ? "khach_phan_nan"
            : null,
          communication: skillScores.communication,
          technical: skillScores.technical,
          problemSolving: skillScores.problemSolving,
          customerExperience: skillScores.customerExperience,
          upsale: skillScores.upsale,
          totalScore,
          level,
          strengths: evaluation.strengths || [],
          improvements: evaluation.improvements || [],
          assessedBy: "AI",
        },
      });
    } catch (err) {
      console.error("Error creating skill assessment:", err);
      // Continue without failing
    }

      // Save skill progress
      if (evaluation.assessment) {
        const assessment = evaluation.assessment as any;
        // Map roleplay skills to SkillProgress model skills
        const skills = [
          {
            skill: "emotion", // Communication/Tone -> emotion
            score: assessment.communication?.score || 0,
          },
          {
            skill: "analysis", // Technical Understanding -> analysis
            score: assessment.technicalUnderstanding?.score || 0,
          },
          {
            skill: "suggestion", // Problem Solving -> suggestion
            score: assessment.problemSolving?.score || 0,
          },
          {
            skill: "closing", // Upsale -> closing
            score: assessment.upsale?.score || 0,
          },
          {
            skill: "questioning", // Customer Experience -> questioning
            score: assessment.customerExperience?.score || 0,
          },
        ];

        for (const skillData of skills) {
          // Convert to 0-10 scale
          const score10 = Math.round((skillData.score / 20) * 10);
          await prisma.skillProgress.create({
            data: {
              userId: session.userId,
              skill: skillData.skill,
              score: score10,
              source: "roleplay",
              refId: sessionId,
            },
          });
        }
      }

    return NextResponse.json({
      success: true,
      session: updatedSession,
      evaluation,
    });
  } catch (err: any) {
    console.error("Evaluate roleplay error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to evaluate roleplay",
      },
      { status: 500 }
    );
  }
}

