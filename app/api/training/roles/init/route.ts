// ============================================
// Training - Initialize Roles & Levels
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Initialize training roles and levels for Chí Tâm Salon
 */
export async function POST(req: Request) {
  try {
    // Check if roles already exist
    const existing = await prisma.trainingRole.count();
    if (existing > 0) {
      return NextResponse.json({
        success: true,
        message: "Training roles already initialized",
        skipped: true,
      });
    }

    const rolesData = [
      {
        name: "RECEPTIONIST",
        description: "Lễ tân - Đón tiếp khách hàng",
        levels: [
          {
            level: 1,
            name: "Beginner",
            description: "Lễ tân mới - Học kiến thức cơ bản",
            requirements: {
              modules: ["SOP Lễ tân", "Giao tiếp cơ bản", "Sản phẩm cơ bản"],
              minScore: 70,
            },
          },
          {
            level: 2,
            name: "Semi-Pro",
            description: "Lễ tân chuyên nghiệp - Tư vấn cơ bản",
            requirements: {
              modules: ["Tư vấn dịch vụ", "Upsale cơ bản", "Xử lý phàn nàn"],
              minScore: 75,
            },
          },
          {
            level: 3,
            name: "Pro",
            description: "Lễ tân chính - Xử lý tình huống nâng cao",
            requirements: {
              modules: ["Tư vấn nâng cao", "Upsale tinh tế", "Xử lý khách khó"],
              minScore: 80,
            },
          },
          {
            level: 4,
            name: "Expert",
            description: "Leader - Đào tạo và giám sát",
            requirements: {
              modules: ["Đào tạo người khác", "Giám sát vận hành"],
              minScore: 85,
            },
          },
        ],
      },
      {
        name: "STYLIST",
        description: "Stylist - Thợ làm tóc",
        levels: [
          {
            level: 1,
            name: "Beginner",
            description: "Stylist phụ - Học kỹ thuật cơ bản",
            requirements: {
              modules: ["Kỹ thuật cơ bản", "Sản phẩm cơ bản", "SOP Stylist"],
              minScore: 70,
            },
          },
          {
            level: 2,
            name: "Semi-Pro",
            description: "Kỹ thuật viên - Uốn nhuộm cơ bản",
            requirements: {
              modules: ["Uốn nóng/lạnh", "Nhuộm", "Chăm sóc"],
              minScore: 75,
            },
          },
          {
            level: 3,
            name: "Pro",
            description: "Stylist chính - Xử lý rủi ro, tư vấn nâng cao",
            requirements: {
              modules: ["Xử lý rủi ro", "Tư vấn nâng cao", "Upsale tinh tế"],
              minScore: 80,
            },
          },
          {
            level: 4,
            name: "Expert",
            description: "Leader - Đào tạo, kiểm soát chất lượng",
            requirements: {
              modules: ["Đào tạo", "Kiểm soát chất lượng"],
              minScore: 85,
            },
          },
        ],
      },
      {
        name: "ASSISTANT",
        description: "Pha chế / Phụ việc",
        levels: [
          {
            level: 1,
            name: "Beginner",
            description: "Pha chế mới",
            requirements: {
              modules: ["SOP Pha chế", "Công thức cơ bản"],
              minScore: 70,
            },
          },
          {
            level: 2,
            name: "Semi-Pro",
            description: "Pha chế chuyên nghiệp",
            requirements: {
              modules: ["Công thức nâng cao", "Xử lý rủi ro"],
              minScore: 75,
            },
          },
          {
            level: 3,
            name: "Pro",
            description: "Pha chế chính",
            requirements: {
              modules: ["Quản lý tồn kho", "Đào tạo"],
              minScore: 80,
            },
          },
        ],
      },
      {
        name: "CSKH_ONLINE",
        description: "CSKH Online - Chăm sóc khách hàng online",
        levels: [
          {
            level: 1,
            name: "Beginner",
            description: "CSKH Online mới",
            requirements: {
              modules: ["SOP CSKH Online", "Kịch bản cơ bản"],
              minScore: 70,
            },
          },
          {
            level: 2,
            name: "Semi-Pro",
            description: "CSKH Online chuyên nghiệp",
            requirements: {
              modules: ["Tư vấn online", "Auto-booking"],
              minScore: 75,
            },
          },
          {
            level: 3,
            name: "Pro",
            description: "CSKH Online chính",
            requirements: {
              modules: ["Xử lý khách khó", "Chiến dịch marketing"],
              minScore: 80,
            },
          },
        ],
      },
    ];

    const created = [];

    for (const roleData of rolesData) {
      const role = await prisma.trainingRole.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          levels: {
            create: roleData.levels.map((levelData) => ({
              level: levelData.level,
              name: levelData.name,
              description: levelData.description,
              requirements: levelData.requirements,
              modules: [],
            })),
          },
        },
      });
      created.push(role);
    }

    return NextResponse.json({
      success: true,
      created: created.length,
      message: `Initialized ${created.length} training roles with levels`,
    });
  } catch (err: any) {
    console.error("Init training roles error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to initialize training roles",
      },
      { status: 500 }
    );
  }
}

