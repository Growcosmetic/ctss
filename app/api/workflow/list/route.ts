import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { type, startDate, endDate } = await req.json();

    // Build where conditions
    const whereConditions: any[] = [];

    if (type) {
      whereConditions.push({ type });
    }

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

    // @ts-ignore - workflowRun may not be generated yet
    const items = await prisma.workflowRun.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : {},
      orderBy: { createdAt: "desc" },
      take: 200, // giới hạn để load nhanh
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("Workflow list error:", err);
    return NextResponse.json({ error: "Load failed" }, { status: 500 });
  }
}

