// ============================================
// Product Units - Đơn vị tính sản phẩm
// ============================================

/**
 * Đơn vị đếm (Counting Units)
 * Dùng để đếm số lượng sản phẩm
 */
export const COUNTING_UNITS = {
  TUBE: "Ống",
  BOTTLE: "Chai",
  BAG: "Túi",
  BOX: "Hộp",
  PIECE: "Cái",
  PACK: "Gói",
  SET: "Bộ",
  ROLL: "Cuộn",
  SHEET: "Tờ",
  UNIT: "Đơn vị",
} as const;

/**
 * Đơn vị dung tích/Khối lượng (Capacity/Weight Units)
 * Dùng để đo dung tích hoặc khối lượng
 */
export const CAPACITY_UNITS = {
  ML: "ml",
  L: "l",
  G: "g",
  KG: "kg",
  MG: "mg",
} as const;

/**
 * Tất cả các đơn vị đếm
 */
export const COUNTING_UNIT_OPTIONS = Object.values(COUNTING_UNITS);

/**
 * Tất cả các đơn vị dung tích
 */
export const CAPACITY_UNIT_OPTIONS = Object.values(CAPACITY_UNITS);

/**
 * Format đơn vị để hiển thị
 */
export function formatUnit(countingUnit: string, capacity?: number, capacityUnit?: string): string {
  if (capacity && capacityUnit) {
    return `${countingUnit} (${capacity}${capacityUnit})`;
  }
  return countingUnit;
}

/**
 * Parse đơn vị từ string
 */
export function parseUnit(unitString: string): {
  countingUnit: string;
  capacity?: number;
  capacityUnit?: string;
} {
  // Format: "Ống (15ml)" hoặc "Ống"
  const match = unitString.match(/^(.+?)\s*\((\d+)(.+?)\)$/);
  if (match) {
    return {
      countingUnit: match[1].trim(),
      capacity: parseFloat(match[2]),
      capacityUnit: match[3].trim(),
    };
  }
  return {
    countingUnit: unitString.trim(),
  };
}
