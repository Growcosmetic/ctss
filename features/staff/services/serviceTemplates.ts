// ============================================
// Service Checklist Templates
// ============================================

export const serviceTemplates: Record<string, string[]> = {
  // Perm (Uốn)
  perm_cold: [
    "Tư vấn khách hàng",
    "Shampoo làm sạch",
    "Lotion #1 (uốn)",
    "Test curl",
    "Neutralizer (cố định)",
    "Treatment phục hồi",
    "Finish styling",
  ],
  perm_hot: [
    "Tư vấn khách hàng",
    "Shampoo làm sạch",
    "Làm khô tóc",
    "Uốn bằng máy",
    "Test curl",
    "Treatment phục hồi",
    "Finish styling",
  ],

  // Color (Nhuộm)
  color_basic: [
    "Tư vấn màu",
    "Test patch",
    "Shampoo làm sạch",
    "Tẩy màu (nếu cần)",
    "Nhuộm màu chính",
    "Ủ màu",
    "Rửa sạch",
    "Treatment phục hồi",
    "Finish styling",
  ],
  color_highlight: [
    "Tư vấn highlight",
    "Shampoo làm sạch",
    "Tách tóc",
    "Tẩy highlight",
    "Nhuộm highlight",
    "Ủ màu",
    "Rửa sạch",
    "Treatment phục hồi",
    "Finish styling",
  ],
  color_balayage: [
    "Tư vấn balayage",
    "Shampoo làm sạch",
    "Tách tóc",
    "Tẩy balayage",
    "Nhuộm balayage",
    "Ủ màu",
    "Rửa sạch",
    "Treatment phục hồi",
    "Finish styling",
  ],

  // Cut (Cắt)
  cut_basic: [
    "Tư vấn kiểu tóc",
    "Shampoo làm sạch",
    "Cắt tóc",
    "Tạo kiểu",
    "Finish styling",
  ],
  cut_layered: [
    "Tư vấn kiểu tóc",
    "Shampoo làm sạch",
    "Cắt layer",
    "Tạo kiểu",
    "Finish styling",
  ],

  // Treatment (Phục hồi)
  treatment_basic: [
    "Tư vấn tình trạng tóc",
    "Shampoo làm sạch",
    "Treatment mask",
    "Ủ ấm",
    "Rửa sạch",
    "Finish styling",
  ],
  treatment_keratin: [
    "Tư vấn keratin",
    "Shampoo làm sạch",
    "Keratin treatment",
    "Sấy thẳng",
    "Finish styling",
  ],

  // Default template
  default: [
    "Tư vấn dịch vụ",
    "Chuẩn bị",
    "Thực hiện dịch vụ",
    "Hoàn thiện",
  ],
};

/**
 * Get checklist template for a service
 */
export function getServiceTemplate(serviceName: string): string[] {
  const lowerName = serviceName.toLowerCase();

  // Match service name to template
  if (lowerName.includes("uốn") || lowerName.includes("perm")) {
    if (lowerName.includes("lạnh") || lowerName.includes("cold")) {
      return serviceTemplates.perm_cold;
    }
    return serviceTemplates.perm_hot;
  }

  if (lowerName.includes("nhuộm") || lowerName.includes("color") || lowerName.includes("dye")) {
    if (lowerName.includes("highlight")) {
      return serviceTemplates.color_highlight;
    }
    if (lowerName.includes("balayage")) {
      return serviceTemplates.color_balayage;
    }
    return serviceTemplates.color_basic;
  }

  if (lowerName.includes("cắt") || lowerName.includes("cut")) {
    if (lowerName.includes("layer")) {
      return serviceTemplates.cut_layered;
    }
    return serviceTemplates.cut_basic;
  }

  if (lowerName.includes("phục hồi") || lowerName.includes("treatment")) {
    if (lowerName.includes("keratin")) {
      return serviceTemplates.treatment_keratin;
    }
    return serviceTemplates.treatment_basic;
  }

  return serviceTemplates.default;
}

