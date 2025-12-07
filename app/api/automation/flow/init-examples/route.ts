// ============================================
// Automation - Initialize Example Flows
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Create example automation flows for Chí Tâm Salon
 */
export async function POST(req: Request) {
  try {
    // Check if examples already exist
    const existing = await prisma.automationFlow.count({
      where: {
        name: {
          in: [
            "Follow-up sau khi làm dịch vụ",
            "Quay lại uốn 6 tuần",
            "Giữ chân khách sắp mất",
          ],
        },
      },
    });

    if (existing > 0) {
      return NextResponse.json({
        success: true,
        message: "Example flows already exist",
        skipped: true,
      });
    }

    const examples = [
      // Flow 1: Follow-up sau khi làm dịch vụ
      {
        name: "Follow-up sau khi làm dịch vụ",
        description:
          "Tự động gửi follow-up 24h sau khi khách làm dịch vụ, tạo reminder phục hồi, và trigger AI insight",
        trigger: "visit",
        conditions: {
          service: ["Uốn", "Nhuộm", "Phục hồi"],
        },
        actions: [
          {
            type: "createReminder",
            payload: {
              type: "followup",
              sendAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              message:
                "Dạ em chào chị! Hôm qua chị có làm dịch vụ bên em. Không biết hôm nay tóc chị vào nếp ok không ạ? Nếu có gì chưa ưng ý, cứ nhắn em nha ❤️",
              channel: "zalo",
            },
          },
          {
            type: "createReminder",
            payload: {
              type: "recovery",
              sendAt: new Date(
                Date.now() + 14 * 24 * 60 * 60 * 1000
              ).toISOString(),
              message:
                "Chị ơi để tóc chắc khỏe hơn, chị nên qua em phục hồi nhẹ 20 phút trong tuần này nha. Treatment phục hồi sẽ giúp tóc mình đàn hồi tốt hơn ❤️",
              channel: "zalo",
            },
          },
          {
            type: "triggerAIInsight",
          },
        ],
        active: true,
      },

      // Flow 2: Quay lại uốn 6 tuần
      {
        name: "Quay lại uốn 6 tuần",
        description:
          "Nhắc khách hay uốn quay lại chỉnh nếp sau 6 tuần",
        trigger: "time",
        conditions: {
          tag: "Hay uốn",
          daysSinceLastVisit: 40, // ~6 tuần
        },
        actions: [
          {
            type: "sendMessage",
            channel: "zalo",
            message:
              "Dạ em chào chị! Chị ơi đã gần 6 tuần từ lần uốn gần nhất của chị rồi nè. Đây là thời điểm đẹp nhất để mình chỉnh nếp lại, giúp tóc vào nếp đều và đẹp hơn ạ. Chị muốn em giữ lịch đẹp cho lần này không ạ? ❤️",
          },
          {
            type: "createReminder",
            payload: {
              type: "rebook_curl",
              sendAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              message:
                "Chị ơi em nhắc lại lần nữa, đã đến lúc chỉnh nếp rồi nè. Em sẵn sàng giữ lịch đẹp cho chị ❤️",
              channel: "zalo",
            },
          },
        ],
        active: true,
      },

      // Flow 3: Giữ chân khách sắp mất
      {
        name: "Giữ chân khách sắp mất",
        description:
          "Tự động kích hoạt khi AI phát hiện khách có HIGH churn risk",
        trigger: "ai",
        conditions: {
          churnRisk: "HIGH",
        },
        actions: [
          {
            type: "sendMessage",
            channel: "zalo",
            message:
              "Dạ em chào chị! Em nhớ chị lắm! Đã lâu rồi em chưa được gặp chị. Bên em có chương trình đặc biệt cho khách thân quay lại, chị muốn em gửi chi tiết không ạ? Em sẽ giữ lịch đẹp nhất cho chị nha ❤️",
          },
          {
            type: "createReminder",
            payload: {
              type: "overdue",
              sendAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              message:
                "Chị ơi em nhắc lại, em đang chờ chị quay lại nè. Em có ưu đãi đặc biệt cho chị đấy ❤️",
              channel: "zalo",
            },
          },
          {
            type: "triggerAIInsight",
          },
        ],
        active: true,
      },
    ];

    const created = await prisma.automationFlow.createMany({
      data: examples,
    });

    return NextResponse.json({
      success: true,
      created: created.count,
      message: `Created ${created.count} example flows`,
    });
  } catch (err: any) {
    console.error("Init examples error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to initialize example flows",
      },
      { status: 500 }
    );
  }
}

