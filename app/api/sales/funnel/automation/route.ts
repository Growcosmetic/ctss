// ============================================
// Sales Funnel - Automation flows
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Predefined automation flows
const AUTOMATION_FLOWS = {
  SERVICE_CONSIDERATION: [
    { day: 0, action: "REMINDER", content: "Nhắc lại before/after" },
    { day: 2, action: "COLOR_CHART", content: "Gửi bảng màu phù hợp" },
    { day: 4, action: "OFFER", content: "Ưu đãi 10% uốn–nhuộm" },
    { day: 6, action: "VIDEO", content: "Video tư vấn cá nhân hóa" },
    { day: 10, action: "CALL_TO_ACTION", content: "Chị muốn làm đẹp đợt này không?" },
  ],
  PRODUCT_HOMECARE: [
    { day: 0, action: "INSTRUCTION", content: "Gửi hướng dẫn sử dụng" },
    { day: 3, action: "FOLLOW_UP", content: "Hỏi thăm kết quả" },
    { day: 7, action: "UPSELL", content: "Gợi ý sản phẩm bổ sung" },
    { day: 14, action: "COMBO", content: "Giảm giá combo 2++" },
  ],
  POST_SERVICE: [
    { day: 1, action: "THANK_YOU", content: "Cảm ơn và hỏi thăm" },
    { day: 3, action: "CARE_TIPS", content: "Gửi tips chăm sóc" },
    { day: 7, action: "RESULT_CHECK", content: "Kiểm tra kết quả" },
    { day: 21, action: "RETURN_REMINDER", content: "Nhắc quay lại" },
  ],
};

export async function POST(req: Request) {
  try {
    const {
      funnelId,
      flowType,
      customerId,
      funnelStage,
    } = await req.json();

    if (!flowType || !customerId) {
      return NextResponse.json(
        { error: "flowType and customerId are required" },
        { status: 400 }
      );
    }

    const validFlows = Object.keys(AUTOMATION_FLOWS);
    if (!validFlows.includes(flowType)) {
      return NextResponse.json(
        { error: "Invalid flow type" },
        { status: 400 }
      );
    }

    // Get or create funnel
    let funnel = await prisma.salesFunnel.findFirst({
      where: {
        id: funnelId || undefined,
        customerId,
        funnelStage: funnelStage || undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!funnel) {
      funnel = await prisma.salesFunnel.create({
        data: {
          customerId,
          funnelStage: funnelStage || "CONSIDERATION",
          automationActive: true,
        },
      });
    }

    // Get flow steps
    const flow = AUTOMATION_FLOWS[flowType as keyof typeof AUTOMATION_FLOWS];

    // Calculate next action
    const now = new Date();
    const createdDate = funnel.createdAt;
    const daysSinceStart = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Find next action
    let nextAction = null;
    let nextActionDate: Date | null = null;

    for (const step of flow) {
      if (daysSinceStart < step.day) {
        nextAction = step;
        nextActionDate = new Date(createdDate);
        nextActionDate.setDate(nextActionDate.getDate() + step.day);
        break;
      }
    }

    // Update funnel
    funnel = await prisma.salesFunnel.update({
      where: { id: funnel.id },
      data: {
        nextAction: nextAction?.action || null,
        nextActionDate,
        automationActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      funnel,
      flow,
      nextAction,
      nextActionDate,
    });
  } catch (err: any) {
    console.error("Funnel automation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to setup automation",
      },
      { status: 500 }
    );
  }
}

// Get automation flows
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const where: any = { automationActive: true };
    if (customerId) where.customerId = customerId;

    const funnels = await prisma.salesFunnel.findMany({
      where,
      orderBy: { nextActionDate: "asc" },
    });

    // Filter funnels with upcoming actions
    const now = new Date();
    const upcoming = funnels.filter((f) => {
      if (!f.nextActionDate) return false;
      return f.nextActionDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
    });

    return NextResponse.json({
      success: true,
      funnels,
      upcoming,
      availableFlows: Object.keys(AUTOMATION_FLOWS),
    });
  } catch (err: any) {
    console.error("Get automation flows error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get automation flows",
      },
      { status: 500 }
    );
  }
}

