import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let items;
    try {
      // @ts-ignore - Model may not be generated yet
      items = await prisma.stylistAnalysis.findMany({
        orderBy: { createdAt: "desc" }
      });
    } catch (dbError: any) {
      // Return empty if model doesn't exist
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("Property 'stylistAnalysis'")) {
        items = [];
      } else {
        throw dbError;
      }
    }

    // Create CSV format (simple, no external library needed)
    const headers = [
      "Ngày",
      "Tình trạng tóc",
      "Lịch sử",
      "Mục tiêu",
      "Loại xoăn",
      "Hư tổn",
      "Rủi ro",
    ];

    const rows = items.map((item) => [
      new Date(item.createdAt).toLocaleString("vi-VN"),
      `"${item.hairCondition.replace(/"/g, '""')}"`,
      `"${item.hairHistory.replace(/"/g, '""')}"`,
      `"${item.customerGoal.replace(/"/g, '""')}"`,
      item.curlType || "",
      item.hairDamageLevel || "",
      (item.resultJson as any).riskLevel || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    // Convert to Excel-compatible format (CSV for now, can be upgraded to xlsx later)
    const buffer = Buffer.from("\uFEFF" + csvContent, "utf-8"); // BOM for Excel UTF-8

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=stylist_analysis.csv",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
