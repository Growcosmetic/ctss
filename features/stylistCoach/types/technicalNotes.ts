// ============================================
// Stylist Coach - Technical Notes Types
// ============================================

export interface TechnicalNote {
  id: string;
  date: string;
  stylistName: string;
  service: string;
  formula?: string;
  lotionType?: string;
  neutralizerTime?: string;
  processingTime?: string;
  heatTemperature?: string;
  comment?: string;
}

