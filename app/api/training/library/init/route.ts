// ============================================
// Training - Initialize Module Library
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Initialize full training module library for Chí Tâm Salon
 * 52 modules across 5 categories
 */
export async function POST(req: Request) {
  try {
    // Check if modules already exist
    const existing = await prisma.trainingModule.count();
    if (existing > 0) {
      return NextResponse.json({
        success: true,
        message: "Training modules already initialized",
        skipped: true,
      });
    }

    const modulesData = [
      // ============================================
      // NHÓM 1 - KIẾN THỨC SẢN PHẨM (12 modules)
      // ============================================
      {
        title: "Kiến thức tổng quan về tóc & hóa chất",
        desc: "Cấu trúc tóc, độ pH, Elasticity, Porosity, Tóc hư tổn",
        category: "product",
        role: "ALL",
        order: 1,
        lessons: [
          {
            title: "Cấu trúc sợi tóc",
            order: 1,
            content: {
              text: "Bài học về cấu trúc sợi tóc...",
              keyPoints: ["Cuticle", "Cortex", "Medulla"],
            },
          },
          {
            title: "Độ pH và hóa chất",
            order: 2,
            content: {
              text: "Bài học về độ pH...",
            },
          },
          {
            title: "Elasticity và Porosity",
            order: 3,
            content: {
              text: "Bài học về tính đàn hồi và độ rỗng...",
            },
          },
        ],
      },
      {
        title: "Plexis Hot Perm S1/S2",
        desc: "Kiến thức về Plexis Hot Perm",
        category: "product",
        role: "STYLIST",
        order: 2,
      },
      {
        title: "Plexis Acid Aqua Gloss Curl",
        desc: "Acid Aqua Gloss Curl technology",
        category: "product",
        role: "STYLIST",
        order: 3,
      },
      {
        title: "Plexis Neutralizer",
        desc: "Plexis Neutralizer và cách sử dụng",
        category: "product",
        role: "STYLIST",
        order: 4,
      },
      {
        title: "Plexis Cold Perm H/N/S/SS",
        desc: "Cold Perm series",
        category: "product",
        role: "STYLIST",
        order: 5,
      },
      {
        title: "Plexis Aqua Down Fit (Soft Straight)",
        desc: "Duỗi mềm Aqua Down Fit",
        category: "product",
        role: "STYLIST",
        order: 6,
      },
      {
        title: "Plexis Treatment (Aqua Intensive Enhancer)",
        desc: "Phục hồi Aqua Intensive",
        category: "product",
        role: "ALL",
        order: 7,
      },
      {
        title: "Joico KPAK",
        desc: "Joico KPAK treatment",
        category: "product",
        role: "STYLIST",
        order: 8,
      },
      {
        title: "Joico Moisture Recovery",
        desc: "Joico Moisture Recovery",
        category: "product",
        role: "STYLIST",
        order: 9,
      },
      {
        title: "Phác đồ phục hồi Level 1: Khô nhẹ",
        desc: "Treatment cho tóc khô nhẹ",
        category: "product",
        role: "STYLIST",
        order: 10,
      },
      {
        title: "Phác đồ phục hồi Level 2: Giãn - Xốp",
        desc: "Treatment cho tóc giãn xốp",
        category: "product",
        role: "STYLIST",
        order: 11,
      },
      {
        title: "Phác đồ phục hồi Level 3: Cháy",
        desc: "Emergency treatment cho tóc cháy",
        category: "product",
        role: "STYLIST",
        order: 12,
      },

      // ============================================
      // NHÓM 2 - KỸ THUẬT CHUYÊN MÔN (16 modules)
      // ============================================
      {
        title: "Uốn lạnh cơ bản",
        desc: "Cấu trúc uốn lạnh, cách chọn thuốc, kỹ thuật cuốn",
        category: "technical",
        role: "STYLIST",
        order: 13,
      },
      {
        title: "Uốn lạnh nâng cao",
        desc: "Xử lý tóc khó uốn, kỹ thuật nâng cao",
        category: "technical",
        role: "STYLIST",
        order: 14,
        level: 2,
      },
      {
        title: "Uốn nóng (Hot Perm) - Cơ bản",
        desc: "Công nghệ nhiệt, cách chọn trục, test curl",
        category: "technical",
        role: "STYLIST",
        order: 15,
      },
      {
        title: "Uốn nóng - Chẩn đoán và sửa lỗi",
        desc: "Chẩn đoán tóc trước uốn, sửa lỗi khi uốn hỏng",
        category: "technical",
        role: "STYLIST",
        order: 16,
        level: 3,
      },
      {
        title: "Nhuộm - Phối màu căn bản",
        desc: "Nguyên lý phối màu, tạo nền",
        category: "technical",
        role: "STYLIST",
        order: 17,
      },
      {
        title: "Nhuộm - Xử lý base 3 màu",
        desc: "Xử lý tóc base 3 màu phổ biến",
        category: "technical",
        role: "STYLIST",
        order: 18,
      },
      {
        title: "Nhuộm - Màu Hàn Quốc",
        desc: "Kỹ thuật nhuộm màu style Hàn Quốc",
        category: "technical",
        role: "STYLIST",
        order: 19,
      },
      {
        title: "Nhuộm - Màu nâu lạnh & hot trend",
        desc: "Màu nâu lạnh, màu hot trend",
        category: "technical",
        role: "STYLIST",
        order: 20,
      },
      {
        title: "Duỗi - Soft Straight",
        desc: "Cấu trúc tóc cần duỗi, kỹ thuật trung hòa",
        category: "technical",
        role: "STYLIST",
        order: 21,
      },
      {
        title: "Phục hồi - Xác định mức hư tổn",
        desc: "Cách xác định mức hư tổn chính xác",
        category: "technical",
        role: "STYLIST",
        order: 22,
      },
      {
        title: "Phục hồi - Phác đồ theo ngày",
        desc: "Phác đồ phục hồi chi tiết theo từng ngày",
        category: "technical",
        role: "STYLIST",
        order: 23,
        level: 2,
      },
      {
        title: "Phục hồi trước/sau kỹ thuật",
        desc: "Phục hồi trước và sau khi uốn/nhuộm",
        category: "technical",
        role: "STYLIST",
        order: 24,
        level: 2,
      },
      {
        title: "Korean Styling",
        desc: "Kỹ thuật tạo kiểu Hàn Quốc",
        category: "technical",
        role: "STYLIST",
        order: 25,
      },
      {
        title: "Layer + Texture",
        desc: "Kỹ thuật layer và texture",
        category: "technical",
        role: "STYLIST",
        order: 26,
        level: 2,
      },
      {
        title: "Sấy tạo form",
        desc: "Kỹ thuật sấy tạo form chuyên nghiệp",
        category: "technical",
        role: "STYLIST",
        order: 27,
      },
      {
        title: "Kỹ thuật nâng cao - Tổng hợp",
        desc: "Tổng hợp kỹ thuật nâng cao",
        category: "technical",
        role: "STYLIST",
        order: 28,
        level: 3,
      },

      // ============================================
      // NHÓM 3 - GIAO TIẾP & TƯ VẤN (10 modules)
      // ============================================
      {
        title: "SOP 7 bước giao tiếp Chí Tâm",
        desc: "Chuẩn 7 bước giao tiếp cho toàn bộ salon",
        category: "communication",
        role: "ALL",
        order: 29,
      },
      {
        title: "Nghệ thuật tư vấn đúng nhu cầu",
        desc: "Phân tích hành vi, 4 kiểu khách, lắng nghe chủ động",
        category: "communication",
        role: "ALL",
        order: 30,
      },
      {
        title: "Upsale tinh tế",
        desc: "Upsale nhà nghề, gợi ý hợp lý, không làm khách khó chịu",
        category: "communication",
        role: "ALL",
        order: 31,
        level: 2,
      },
      {
        title: "Xử lý rủi ro & phàn nàn",
        desc: "Talkdown, Empathy, Calm, Solution",
        category: "communication",
        role: "ALL",
        order: 32,
        level: 3,
      },
      {
        title: "Giao tiếp lễ tân - Đón khách",
        desc: "Chào, hỏi, check-in",
        category: "communication",
        role: "RECEPTIONIST",
        order: 33,
      },
      {
        title: "Giao tiếp lễ tân - Báo stylist & nhắc lịch",
        desc: "Báo stylist, gọi điện nhắc lịch",
        category: "communication",
        role: "RECEPTIONIST",
        order: 34,
      },
      {
        title: "Giao tiếp CSKH Online - SOP 8 bước",
        desc: "Quy trình 8 bước CSKH online",
        category: "communication",
        role: "CSKH_ONLINE",
        order: 35,
      },
      {
        title: "Giao tiếp CSKH Online - Chốt khách",
        desc: "Kỹ thuật chốt khách qua chat",
        category: "communication",
        role: "CSKH_ONLINE",
        order: 36,
        level: 2,
      },
      {
        title: "Giao tiếp CSKH Online - Follow-up",
        desc: "Kỹ thuật follow-up online",
        category: "communication",
        role: "CSKH_ONLINE",
        order: 37,
        level: 2,
      },
      {
        title: "Tư vấn nâng cao - Stylist",
        desc: "Tư vấn chuyên sâu cho stylist",
        category: "communication",
        role: "STYLIST",
        order: 38,
        level: 3,
      },

      // ============================================
      // NHÓM 4 - SOP TỪNG BỘ PHẬN (8 modules)
      // ============================================
      {
        title: "SOP Lễ tân - Đón khách & Check-in",
        desc: "Đón khách, check-in, quản lý lịch",
        category: "sop",
        role: "RECEPTIONIST",
        order: 39,
      },
      {
        title: "SOP Lễ tân - Checkout",
        desc: "Thanh toán, checkout, gửi khách",
        category: "sop",
        role: "RECEPTIONIST",
        order: 40,
      },
      {
        title: "SOP Stylist - Tư vấn 5 bước",
        desc: "Quy trình tư vấn 5 bước chuẩn",
        category: "sop",
        role: "STYLIST",
        order: 41,
      },
      {
        title: "SOP Stylist - Matrix kỹ thuật & Ảnh",
        desc: "Matrix kỹ thuật, ảnh before/after, báo cáo",
        category: "sop",
        role: "STYLIST",
        order: 42,
        level: 2,
      },
      {
        title: "SOP Pha chế - Chuẩn bị thuốc",
        desc: "Đo gram, chuẩn bị thuốc, ghi phiếu",
        category: "sop",
        role: "ASSISTANT",
        order: 43,
      },
      {
        title: "SOP Pha chế - Báo cáo hao hụt",
        desc: "Quản lý tồn kho, báo cáo hao hụt",
        category: "sop",
        role: "ASSISTANT",
        order: 44,
        level: 2,
      },
      {
        title: "SOP CSKH Online - Xử lý inbox",
        desc: "Xử lý tin nhắn, theo dõi KPI",
        category: "sop",
        role: "CSKH_ONLINE",
        order: 45,
      },
      {
        title: "SOP CSKH Online - Follow-up & KPI",
        desc: "Follow-up, tracking KPI",
        category: "sop",
        role: "CSKH_ONLINE",
        order: 46,
        level: 2,
      },

      // ============================================
      // NHÓM 5 - VĂN HÓA - TƯ DUY - WOW (6 modules)
      // ============================================
      {
        title: "Văn hóa Chí Tâm - Tinh thần phục vụ",
        desc: "Tinh thần phục vụ, làm khách WOW",
        category: "culture",
        role: "ALL",
        order: 47,
      },
      {
        title: "Văn hóa Chí Tâm - Tôn trọng & Kỷ luật",
        desc: "Tôn trọng khách, chuyên nghiệp, kỷ luật",
        category: "culture",
        role: "ALL",
        order: 48,
      },
      {
        title: "Tư duy nghề tóc - Nghệ thuật & Dịch vụ",
        desc: "Nghề tóc = nghệ thuật + dịch vụ",
        category: "culture",
        role: "STYLIST",
        order: 49,
      },
      {
        title: "Tư duy nghề tóc - Long-term & Bảo vệ tóc",
        desc: "Tư duy long-term, không phá cấu trúc tóc",
        category: "culture",
        role: "STYLIST",
        order: 50,
        level: 2,
      },
      {
        title: "Phong cách giao tiếp thương hiệu - Mina",
        desc: "Ngôn ngữ của Mina: Soft, ấm, nữ tính, chuyên nghiệp",
        category: "culture",
        role: "ALL",
        order: 51,
      },
      {
        title: "Xây dựng trải nghiệm khách hàng",
        desc: "Tổng hợp - Xây dựng trải nghiệm khách hàng WOW",
        category: "culture",
        role: "ALL",
        order: 52,
        level: 3,
      },
    ];

    const createdModules = [];

    for (const moduleData of modulesData) {
      const { lessons, ...moduleFields } = moduleData;
      const module = await prisma.trainingModule.create({
        data: {
          ...moduleFields,
          lessons: lessons
            ? {
                create: lessons.map((lesson: any) => ({
                  title: lesson.title,
                  content: lesson.content || null,
                  order: lesson.order,
                  role: moduleFields.role || null,
                  level: lesson.level || moduleFields.level || null,
                })),
              }
            : undefined,
        },
      });
      createdModules.push(module);
    }

    return NextResponse.json({
      success: true,
      created: createdModules.length,
      modules: createdModules.length,
      message: `Initialized ${createdModules.length} training modules across 5 categories`,
    });
  } catch (err: any) {
    console.error("Init training library error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to initialize training library",
      },
      { status: 500 }
    );
  }
}

