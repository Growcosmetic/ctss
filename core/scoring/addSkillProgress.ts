// ============================================
// Skill Progress Aggregator
// Automatically save skill scores from quizzes and simulations
// ============================================

import { prisma } from "@/lib/prisma";

export interface SkillScores {
  questioning?: number;
  analysis?: number;
  suggestion?: number;
  emotion?: number;
  closing?: number;
}

/**
 * Save skill scores from quiz or simulation
 */
export async function saveSkillProgress(
  userId: string,
  scores: SkillScores,
  source: "quiz" | "simulation",
  refId: string
): Promise<void> {
  try {
    const entries = Object.entries(scores)
      .filter(([_, score]) => score !== undefined && score !== null)
      .map(([skill, score]) => ({
        userId,
        skill,
        score: Math.round(score as number), // Ensure integer
        source,
        refId,
      }));

    // Save all skill progress entries
    for (const entry of entries) {
      await prisma.skillProgress.create({
        data: entry,
      });
    }
  } catch (error: any) {
    console.error("Save skill progress error:", error);
    // Don't throw - this is a tracking function, shouldn't break main flow
  }
}

/**
 * Compute skill scores from quiz result
 * (Quiz doesn't have direct skill scores, so we estimate based on overall performance)
 */
export function computeSkillScoresFromQuiz(
  score: number,
  total: number
): SkillScores {
  const percentage = (score / total) * 100;
  // Convert to 0-10 scale
  const baseScore = Math.round((percentage / 100) * 10);

  // Distribute score across all skills (quiz tests overall knowledge)
  return {
    questioning: baseScore,
    analysis: baseScore,
    suggestion: baseScore,
    emotion: baseScore,
    closing: baseScore,
  };
}

