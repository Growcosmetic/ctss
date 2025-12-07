// ============================================
// Product Categories & Units - Danh mục sản phẩm chuẩn
// ============================================

export const PRODUCT_CATEGORIES = {
  CHEMICAL: "Chemical",
  NHUOM: "Nhuộm",
  CARE: "Care",
} as const;

export const PRODUCT_SUBCATEGORIES = {
  // Chemical
  UON_NONG: "Uốn nóng",
  UON_LANH: "Uốn lạnh",
  NEUTRALIZER: "Neutralizer",
  SOFT_STRAIGHT: "Soft Straight",
  TREATMENT: "Treatment",

  // Nhuộm
  THUOC_MAU: "Thuốc màu",
  OXY_DEVELOPER: "Oxy developer",
  BOOSTER: "Booster",

  // Care
  TREATMENT_CARE: "Treatment",
  AMPOULE: "Ampoule",
  MASK: "Mask",
  KERATIN: "Keratin",
  PROTEIN: "Protein",
} as const;

export const PRODUCT_UNITS = {
  GRAM: "g",
  MILLILITER: "ml",
  TUBE: "tube",
  BOTTLE: "bottle",
} as const;

export const PRODUCT_EXAMPLES = [
  // Chemical - Uốn nóng
  {
    name: "Plexis Hot Perm S1",
    category: PRODUCT_CATEGORIES.CHEMICAL,
    subCategory: PRODUCT_SUBCATEGORIES.UON_NONG,
    unit: PRODUCT_UNITS.GRAM,
    defaultPricePerUnit: 2000, // 2000đ/gram
  },
  {
    name: "Plexis Hot Perm S2",
    category: PRODUCT_CATEGORIES.CHEMICAL,
    subCategory: PRODUCT_SUBCATEGORIES.UON_NONG,
    unit: PRODUCT_UNITS.GRAM,
    defaultPricePerUnit: 2000,
  },
  {
    name: "Plexis Acid Aqua Gloss Curl",
    category: PRODUCT_CATEGORIES.CHEMICAL,
    subCategory: PRODUCT_SUBCATEGORIES.UON_LANH,
    unit: PRODUCT_UNITS.GRAM,
    defaultPricePerUnit: 2500,
  },
  {
    name: "Plexis Neutralizer",
    category: PRODUCT_CATEGORIES.CHEMICAL,
    subCategory: PRODUCT_SUBCATEGORIES.NEUTRALIZER,
    unit: PRODUCT_UNITS.MILLILITER,
    defaultPricePerUnit: 1500,
  },
  {
    name: "Plexis Aqua Down Fit",
    category: PRODUCT_CATEGORIES.CHEMICAL,
    subCategory: PRODUCT_SUBCATEGORIES.SOFT_STRAIGHT,
    unit: PRODUCT_UNITS.GRAM,
    defaultPricePerUnit: 2200,
  },
  {
    name: "Plexis Treatment",
    category: PRODUCT_CATEGORIES.CHEMICAL,
    subCategory: PRODUCT_SUBCATEGORIES.TREATMENT,
    unit: PRODUCT_UNITS.GRAM,
    defaultPricePerUnit: 3000,
  },

  // Nhuộm
  {
    name: "Joico KPAK",
    category: PRODUCT_CATEGORIES.NHUOM,
    subCategory: PRODUCT_SUBCATEGORIES.THUOC_MAU,
    unit: PRODUCT_UNITS.GRAM,
    defaultPricePerUnit: 4000,
  },
  {
    name: "Oxy 6%",
    category: PRODUCT_CATEGORIES.NHUOM,
    subCategory: PRODUCT_SUBCATEGORIES.OXY_DEVELOPER,
    unit: PRODUCT_UNITS.MILLILITER,
    defaultPricePerUnit: 1000,
  },
  {
    name: "Oxy 9%",
    category: PRODUCT_CATEGORIES.NHUOM,
    subCategory: PRODUCT_SUBCATEGORIES.OXY_DEVELOPER,
    unit: PRODUCT_UNITS.MILLILITER,
    defaultPricePerUnit: 1200,
  },
  {
    name: "Oxy 12%",
    category: PRODUCT_CATEGORIES.NHUOM,
    subCategory: PRODUCT_SUBCATEGORIES.OXY_DEVELOPER,
    unit: PRODUCT_UNITS.MILLILITER,
    defaultPricePerUnit: 1500,
  },

  // Care
  {
    name: "Joico Moisture Recovery",
    category: PRODUCT_CATEGORIES.CARE,
    subCategory: PRODUCT_SUBCATEGORIES.TREATMENT_CARE,
    unit: PRODUCT_UNITS.MILLILITER,
    defaultPricePerUnit: 5000,
  },
  {
    name: "Keratin Treatment",
    category: PRODUCT_CATEGORIES.CARE,
    subCategory: PRODUCT_SUBCATEGORIES.KERATIN,
    unit: PRODUCT_UNITS.MILLILITER,
    defaultPricePerUnit: 6000,
  },
];

