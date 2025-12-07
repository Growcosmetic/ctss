// ============================================
// Stylist Coach - Technical Hair Profile Types
// ============================================

export interface TechnicalHairProfile {
  elasticity: "weak" | "medium" | "strong";
  porosity: "low" | "medium" | "high";
  thickness: "fine" | "medium" | "coarse";
  previousChemicals: {
    perm: number;
    color: number;
    bleach: number;
    straightening: number;
  };
  scalpCondition?: string;
  damageLevel: 1 | 2 | 3 | 4 | 5;
  currentLength?: string;
  targetStyle?: string;
}

