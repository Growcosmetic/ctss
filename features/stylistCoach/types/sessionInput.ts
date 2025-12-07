// ============================================
// Stylist Coach - Session Input Types
// ============================================

export interface SessionInput {
  moisture: "low" | "medium" | "high";
  damage: 1 | 2 | 3 | 4 | 5;
  previousChemistry: boolean;
  desiredStyle: string;
  customerConcern?: string;
}

