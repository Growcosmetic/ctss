// ============================================
// Threshold Rules - Hao hụt chuẩn
// ============================================

export interface ThresholdConfig {
  productCategory?: string;
  serviceCategory?: string;
  normalMin?: number;
  normalMax?: number;
  warningMin?: number;
  warningMax?: number;
  alertMin?: number;
  alertMax?: number;
  criticalMin?: number;
  expectedMin?: number;
  expectedMax?: number;
}

// Default threshold rules theo loại sản phẩm
export const DEFAULT_THRESHOLDS: ThresholdConfig[] = [
  // Plexis S1/S2 - Uốn nóng
  {
    productCategory: "Chemical",
    serviceCategory: "Uốn nóng",
    normalMin: 0,
    normalMax: 12,
    warningMin: 12,
    warningMax: 15,
    alertMin: 15,
    alertMax: 25,
    criticalMin: 25,
    expectedMin: 28,
    expectedMax: 35,
  },
  // Neutralizer
  {
    productCategory: "Chemical",
    serviceCategory: "Uốn",
    normalMin: 0,
    normalMax: 10,
    warningMin: 10,
    warningMax: 12,
    alertMin: 12,
    alertMax: 20,
    criticalMin: 20,
    expectedMin: 35,
    expectedMax: 45,
  },
  // Treatment
  {
    productCategory: "Care",
    serviceCategory: "Treatment",
    normalMin: 0,
    normalMax: 12,
    warningMin: 12,
    warningMax: 15,
    alertMin: 15,
    alertMax: 22,
    criticalMin: 22,
    expectedMin: 15,
    expectedMax: 25,
  },
  // Nhuộm màu
  {
    productCategory: "Nhuộm",
    serviceCategory: "Nhuộm",
    normalMin: 0,
    normalMax: 8,
    warningMin: 8,
    warningMax: 12,
    alertMin: 12,
    alertMax: 20,
    criticalMin: 20,
    expectedMin: 20,
    expectedMax: 40,
  },
  // Oxy
  {
    productCategory: "Nhuộm",
    serviceCategory: "Nhuộm",
    normalMin: 0,
    normalMax: 15,
    warningMin: 15,
    warningMax: 18,
    alertMin: 18,
    alertMax: 25,
    criticalMin: 25,
    expectedMin: 50,
    expectedMax: 80,
  },
];

export function getThreshold(
  productCategory?: string,
  serviceCategory?: string,
  productId?: string,
  serviceId?: string
): ThresholdConfig | null {
  // TODO: Query from database ThresholdRule first
  // For now, return default based on category

  const match = DEFAULT_THRESHOLDS.find((t) => {
    if (productCategory && t.productCategory !== productCategory) return false;
    if (serviceCategory && t.serviceCategory !== serviceCategory) return false;
    return true;
  });

  return match || null;
}

export function calculateSeverity(
  lossRate: number,
  threshold?: ThresholdConfig
): {
  severity: "NORMAL" | "WARNING" | "ALERT" | "CRITICAL";
  level: 0 | 1 | 2 | 3;
} {
  if (!threshold) {
    // Default threshold
    if (lossRate <= 10) return { severity: "NORMAL", level: 0 };
    if (lossRate <= 15) return { severity: "WARNING", level: 1 };
    if (lossRate <= 25) return { severity: "ALERT", level: 2 };
    return { severity: "CRITICAL", level: 3 };
  }

  if (lossRate <= (threshold.normalMax || 10)) {
    return { severity: "NORMAL", level: 0 };
  }
  if (lossRate <= (threshold.warningMax || 15)) {
    return { severity: "WARNING", level: 1 };
  }
  if (lossRate <= (threshold.alertMax || 25)) {
    return { severity: "ALERT", level: 2 };
  }
  return { severity: "CRITICAL", level: 3 };
}

