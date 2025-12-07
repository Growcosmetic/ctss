import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { startDate, endDate } = await req.json();

    // Build where clause conditions
    const whereConditions: any[] = [];

    if (startDate) {
      whereConditions.push({
        createdAt: { gte: new Date(startDate + "T00:00:00.000Z") }
      });
    }

    if (endDate) {
      whereConditions.push({
        createdAt: { lte: new Date(endDate + "T23:59:59.999Z") }
      });
    }

    let items;
    try {
      // @ts-ignore - Model may not be generated yet
      items = await prisma.stylistAnalysis.findMany({
        where: whereConditions.length > 0 ? { AND: whereConditions } : {},
        orderBy: { createdAt: "asc" }
      });
    } catch (dbError: any) {
      // Return empty if model doesn't exist
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("Property 'stylistAnalysis'")) {
        items = [];
      } else {
        throw dbError;
      }
    }

    if (!items.length) {
      return NextResponse.json({
        riskStats: [],
        damageStats: [],
        goalStats: [],
        timeline: [],
      });
    }

    const riskStats: Record<string, number> = {};
    const damageStats: Record<string, number> = {};
    const goalStats: Record<string, number> = {};
    const timeline: Record<string, number> = {};

    for (const item of items) {
      const risk = (item.resultJson as any).riskLevel || "UNKNOWN";
      riskStats[risk] = (riskStats[risk] || 0) + 1;

      const d = item.hairDamageLevel || "UNKNOWN";
      damageStats[d] = (damageStats[d] || 0) + 1;

      const g = item.customerGoal || "Không rõ";
      goalStats[g] = (goalStats[g] || 0) + 1;

      const day = item.createdAt.toISOString().split("T")[0];
      timeline[day] = (timeline[day] || 0) + 1;
    }

    return NextResponse.json({
      riskStats,
      damageStats,
      goalStats,
      timeline,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Stats failed" }, { status: 500 });
  }
}

