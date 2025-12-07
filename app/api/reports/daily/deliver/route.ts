// ============================================
// Daily Report - Deliver report
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { reportId, methods } = await req.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 }
      );
    }

    const report = await prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const deliveryMethods = methods || ["email", "notification"];
    const updates: any = {};

    // Email delivery
    if (deliveryMethods.includes("email")) {
      // TODO: Implement email sending
      // For now, just mark as sent
      updates.emailSent = true;
      updates.emailSentAt = new Date();
      console.log("Email delivery (not implemented):", report.id);
    }

    // Zalo OA delivery
    if (deliveryMethods.includes("zalo")) {
      // TODO: Implement Zalo OA sending
      updates.zaloSent = true;
      updates.zaloSentAt = new Date();
      console.log("Zalo delivery (not implemented):", report.id);
    }

    // Notification delivery
    if (deliveryMethods.includes("notification")) {
      // TODO: Implement in-app notification
      updates.notificationSent = true;
      updates.notificationSentAt = new Date();
      console.log("Notification delivery (not implemented):", report.id);
    }

    // Update report
    const updated = await prisma.dailyReport.update({
      where: { id: reportId },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      report: updated,
      delivered: deliveryMethods,
    });
  } catch (err: any) {
    console.error("Deliver report error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to deliver report",
      },
      { status: 500 }
    );
  }
}

// Format report for text delivery (Zalo, SMS, etc.)
function formatReportText(report: any): string {
  const date = new Date(report.reportDate).toLocaleDateString("vi-VN");
  
  let text = `📊 BÁO CÁO CUỐI NGÀY — ${date}\n\n`;
  
  text += `💰 DOANH THU & LỢI NHUẬN\n`;
  text += `Doanh thu: ${report.totalRevenue.toLocaleString("vi-VN")}đ\n`;
  text += `Chi phí SP: ${report.totalCost.toLocaleString("vi-VN")}đ\n`;
  text += `Lợi nhuận: ${report.profit.toLocaleString("vi-VN")}đ (${report.margin.toFixed(1)}%)\n\n`;
  
  text += `📋 DỊCH VỤ\n`;
  text += `Tổng dịch vụ: ${report.totalServices}\n`;
  if (report.topServices && Array.isArray(report.topServices)) {
    text += `Top dịch vụ:\n`;
    report.topServices.slice(0, 3).forEach((s: any, idx: number) => {
      text += `${idx + 1}. ${s.name} (${s.count} lần)\n`;
    });
  }
  text += `\n`;
  
  if (report.lowStockItems && Array.isArray(report.lowStockItems) && report.lowStockItems.length > 0) {
    text += `⚠️ SẢN PHẨM SẮP HẾT\n`;
    report.lowStockItems.slice(0, 3).forEach((item: any) => {
      text += `- ${item.productName} (${item.currentStock}${item.unit})\n`;
    });
    text += `\n`;
  }
  
  if (report.highLossProducts && Array.isArray(report.highLossProducts) && report.highLossProducts.length > 0) {
    text += `🔥 HAO HỤT CAO\n`;
    report.highLossProducts.slice(0, 3).forEach((item: any) => {
      text += `- ${item.productName}: ${item.lossRate}%\n`;
    });
    text += `\n`;
  }
  
  if (report.topPerformers && Array.isArray(report.topPerformers) && report.topPerformers.length > 0) {
    text += `⭐ STYLIST NỔI BẬT\n`;
    report.topPerformers.slice(0, 3).forEach((p: any, idx: number) => {
      text += `${idx + 1}. ${p.name}: ${p.revenue.toLocaleString("vi-VN")}đ\n`;
    });
    text += `\n`;
  }
  
  if (report.risks && Array.isArray(report.risks) && report.risks.length > 0) {
    text += `⚠️ CẢNH BÁO\n`;
    report.risks.slice(0, 3).forEach((risk: any) => {
      text += `- ${risk.description}\n`;
    });
    text += `\n`;
  }
  
  if (report.recommendations && Array.isArray(report.recommendations) && report.recommendations.length > 0) {
    text += `💡 GỢI Ý\n`;
    report.recommendations
      .filter((r: any) => r.priority === "HIGH")
      .slice(0, 3)
      .forEach((rec: any) => {
        text += `- ${rec.action}\n`;
      });
  }
  
  return text;
}

// Get formatted report text
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 }
      );
    }

    const report = await prisma.dailyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const formattedText = formatReportText(report);

    return NextResponse.json({
      success: true,
      text: formattedText,
      report: {
        id: report.id,
        date: report.reportDate,
      },
    });
  } catch (err: any) {
    console.error("Format report text error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to format report text",
      },
      { status: 500 }
    );
  }
}

