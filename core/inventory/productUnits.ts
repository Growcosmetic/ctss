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
  JAR: "Hủ",
  VIAL: "Lọ",
  BAG: "Túi",
  BOX: "Hộp",
  PIECE: "Cái",
  PACK: "Gói",
  SET: "Bộ",
  ROLL: "Cuộn",
  SHEET: "Tờ",
  CAN: "Lon",
  TUB: "Thùng",
  BOTTLE_SMALL: "Chai nhỏ",
  BOTTLE_LARGE: "Chai lớn",
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
  CL: "cl", // Centiliter
  DL: "dl", // Deciliter
} as const;

/**
 * Tất cả các đơn vị đếm (sắp xếp theo thứ tự phổ biến)
 */
export const COUNTING_UNIT_OPTIONS = [
  COUNTING_UNITS.TUBE,      // Ống
  COUNTING_UNITS.BOTTLE,     // Chai
  COUNTING_UNITS.JAR,        // Hủ
  COUNTING_UNITS.VIAL,       // Lọ
  COUNTING_UNITS.BAG,        // Túi
  COUNTING_UNITS.BOX,        // Hộp
  COUNTING_UNITS.PIECE,      // Cái
  COUNTING_UNITS.PACK,       // Gói
  COUNTING_UNITS.SET,        // Bộ
  COUNTING_UNITS.CAN,        // Lon
  COUNTING_UNITS.TUB,        // Thùng
  COUNTING_UNITS.BOTTLE_SMALL, // Chai nhỏ
  COUNTING_UNITS.BOTTLE_LARGE, // Chai lớn
  COUNTING_UNITS.ROLL,       // Cuộn
  COUNTING_UNITS.SHEET,      // Tờ
  COUNTING_UNITS.UNIT,       // Đơn vị
];

/**
 * Tất cả các đơn vị dung tích (sắp xếp theo thứ tự phổ biến)
 */
export const CAPACITY_UNIT_OPTIONS = [
  CAPACITY_UNITS.ML,   // ml
  CAPACITY_UNITS.L,    // l
  CAPACITY_UNITS.G,    // g (gram)
  CAPACITY_UNITS.KG,   // kg
  CAPACITY_UNITS.CL,   // cl
  CAPACITY_UNITS.DL,   // dl
  CAPACITY_UNITS.MG,   // mg
];

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
