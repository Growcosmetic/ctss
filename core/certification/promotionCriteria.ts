// ============================================
// Promotion Criteria - Điều kiện thăng cấp
// ============================================

export interface PromotionCriteria {
  level: number;
  name: string;
  requirements: {
    moduleCompletionRate: number; // % module hoàn thành
    averageRoleplayScore: number; // Điểm roleplay trung bình
    minRoleplayCount: number; // Số buổi roleplay tối thiểu
    minRoleplayScore: number; // Điểm roleplay tối thiểu (3 buổi)
    minSkillScore: number; // Không kỹ năng nào dưới điểm này
    specificModules?: string[]; // Module bắt buộc
    specificRoleplays?: string[]; // Roleplay bắt buộc (với điểm tối thiểu)
    minTechnicalScore?: number; // Điểm Technical tối thiểu (cho Stylist)
    noSOPViolations?: number; // Không vi phạm SOP trong X ngày
  };
}

export const PROMOTION_CRITERIA: Record<string, PromotionCriteria[]> = {
  STYLIST: [
    {
      level: 1,
      name: "Assistant",
      requirements: {
        moduleCompletionRate: 60,
        averageRoleplayScore: 70,
        minRoleplayCount: 2,
        minRoleplayScore: 70,
        minSkillScore: 10,
      },
    },
    {
      level: 2,
      name: "Junior Stylist",
      requirements: {
        moduleCompletionRate: 80,
        averageRoleplayScore: 75,
        minRoleplayCount: 3,
        minRoleplayScore: 75,
        minSkillScore: 12,
        specificModules: [
          "Uốn lạnh căn bản",
          "Test curl",
          "Cuốn ống",
          "SOP tư vấn 5 bước",
        ],
      },
    },
    {
      level: 3,
      name: "Senior Stylist",
      requirements: {
        moduleCompletionRate: 85,
        averageRoleplayScore: 80,
        minRoleplayCount: 5,
        minRoleplayScore: 80,
        minSkillScore: 14,
        specificRoleplays: [
          { type: "khach_kho_tinh", minScore: 80 },
          { type: "khach_so_hu_toc", minScore: 80 },
        ],
        specificModules: [
          "Uốn nóng nâng cao",
          "Nhuộm nâng cao",
          "Phục hồi chuyên sâu",
        ],
      },
    },
    {
      level: 4,
      name: "Master Stylist",
      requirements: {
        moduleCompletionRate: 95,
        averageRoleplayScore: 85,
        minRoleplayCount: 8,
        minRoleplayScore: 85,
        minSkillScore: 16,
        minTechnicalScore: 18,
        noSOPViolations: 60, // 60 ngày không vi phạm
      },
    },
  ],
  RECEPTIONIST: [
    {
      level: 1,
      name: "Receptionist Trainee",
      requirements: {
        moduleCompletionRate: 60,
        averageRoleplayScore: 70,
        minRoleplayCount: 2,
        minRoleplayScore: 70,
        minSkillScore: 10,
      },
    },
    {
      level: 2,
      name: "Receptionist",
      requirements: {
        moduleCompletionRate: 80,
        averageRoleplayScore: 75,
        minRoleplayCount: 3,
        minRoleplayScore: 75,
        minSkillScore: 12,
        specificModules: [
          "SOP Lễ tân - Đón khách",
          "Quản lý lịch",
          "Giao tiếp lễ tân",
        ],
      },
    },
    {
      level: 3,
      name: "Senior Receptionist",
      requirements: {
        moduleCompletionRate: 85,
        averageRoleplayScore: 80,
        minRoleplayCount: 5,
        minRoleplayScore: 80,
        minSkillScore: 14,
        specificRoleplays: [
          { type: "khach_gap", minScore: 80 },
        ] as any,
      },
    },
    {
      level: 4,
      name: "Front Desk Leader",
      requirements: {
        moduleCompletionRate: 95,
        averageRoleplayScore: 85,
        minRoleplayCount: 8,
        minRoleplayScore: 85,
        minSkillScore: 16,
        noSOPViolations: 60,
      },
    },
  ],
  ASSISTANT: [
    {
      level: 1,
      name: "Prep Staff",
      requirements: {
        moduleCompletionRate: 60,
        averageRoleplayScore: 70,
        minRoleplayCount: 2,
        minRoleplayScore: 70,
        minSkillScore: 10,
      },
    },
    {
      level: 2,
      name: "Mixing Technician",
      requirements: {
        moduleCompletionRate: 80,
        averageRoleplayScore: 75,
        minRoleplayCount: 3,
        minRoleplayScore: 75,
        minSkillScore: 12,
        specificModules: [
          "SOP Pha Chế - Chuẩn bị",
          "Đo gram",
          "Pha thuốc theo công thức",
        ],
      },
    },
    {
      level: 3,
      name: "Senior Mixer",
      requirements: {
        moduleCompletionRate: 85,
        averageRoleplayScore: 80,
        minRoleplayCount: 5,
        minRoleplayScore: 80,
        minSkillScore: 14,
      },
    },
    {
      level: 4,
      name: "Pha Chế Leader",
      requirements: {
        moduleCompletionRate: 95,
        averageRoleplayScore: 85,
        minRoleplayCount: 8,
        minRoleplayScore: 85,
        minSkillScore: 16,
        noSOPViolations: 60,
      },
    },
  ],
  CSKH_ONLINE: [
    {
      level: 1,
      name: "Trainee",
      requirements: {
        moduleCompletionRate: 60,
        averageRoleplayScore: 70,
        minRoleplayCount: 2,
        minRoleplayScore: 70,
        minSkillScore: 10,
      },
    },
    {
      level: 2,
      name: "CSKH",
      requirements: {
        moduleCompletionRate: 80,
        averageRoleplayScore: 75,
        minRoleplayCount: 3,
        minRoleplayScore: 75,
        minSkillScore: 12,
        specificModules: [
          "SOP CSKH Online",
          "Xử lý inbox",
          "Chốt khách online",
        ],
      },
    },
    {
      level: 3,
      name: "Senior CSKH",
      requirements: {
        moduleCompletionRate: 85,
        averageRoleplayScore: 80,
        minRoleplayCount: 5,
        minRoleplayScore: 80,
        minSkillScore: 14,
        specificRoleplays: [
          { type: "khach_phan_nan", minScore: 80 },
        ] as any,
      },
    },
    {
      level: 4,
      name: "CSKH Leader",
      requirements: {
        moduleCompletionRate: 95,
        averageRoleplayScore: 85,
        minRoleplayCount: 8,
        minRoleplayScore: 85,
        minSkillScore: 16,
        noSOPViolations: 60,
      },
    },
  ],
};

export function getPromotionCriteria(
  role: string,
  currentLevel: number
): PromotionCriteria | null {
  const criteria = PROMOTION_CRITERIA[role];
  if (!criteria) return null;

  // Get criteria for next level
  const nextLevel = currentLevel + 1;
  return criteria.find((c) => c.level === nextLevel) || null;
}

