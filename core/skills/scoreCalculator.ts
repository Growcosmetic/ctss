// ============================================
// Score Calculator - Calculate skill levels
// ============================================

export interface SkillScores {
  communication: number;
  technical: number;
  problemSolving: number;
  customerExperience: number;
  upsale: number;
}

export function calculateTotalScore(scores: SkillScores): number {
  return (
    scores.communication +
    scores.technical +
    scores.problemSolving +
    scores.customerExperience +
    scores.upsale
  );
}

export function getSkillLevel(totalScore: number): string {
  if (totalScore >= 90) return "Master";
  if (totalScore >= 80) return "Excellent";
  if (totalScore >= 70) return "Good";
  if (totalScore >= 60) return "Average";
  return "Needs Improvement";
}

export function getSkillLevelColor(level: string): string {
  const colors: Record<string, string> = {
    Master: "text-purple-600 bg-purple-100",
    Excellent: "text-green-600 bg-green-100",
    Good: "text-blue-600 bg-blue-100",
    Average: "text-yellow-600 bg-yellow-100",
    "Needs Improvement": "text-red-600 bg-red-100",
  };
  return colors[level] || "text-gray-600 bg-gray-100";
}

export function detectWeakSkills(scores: SkillScores): string[] {
  const skillNames: Record<keyof SkillScores, string> = {
    communication: "Communication",
    technical: "Technical Knowledge",
    problemSolving: "Problem Solving",
    customerExperience: "Customer Experience",
    upsale: "Upsale Tinh Tế",
  };

  const weaknesses: string[] = [];
  const threshold = 14; // Dưới 14/20 là yếu

  Object.entries(scores).forEach(([key, score]) => {
    if (score < threshold) {
      weaknesses.push(skillNames[key as keyof SkillScores]);
    }
  });

  return weaknesses;
}

