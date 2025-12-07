import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { search, damageLevel, curlType, goal, startDate, endDate } =
      await req.json();

    // Build where clause conditions
    const whereConditions: any[] = [];

    // Search condition (across multiple fields)
    if (search) {
      whereConditions.push({
        OR: [
          { hairCondition: { contains: search, mode: "insensitive" } },
          { customerGoal: { contains: search, mode: "insensitive" } },
          { hairHistory: { contains: search, mode: "insensitive" } }
        ]
      });
    }

    // Filter by damage level
    if (damageLevel) {
      whereConditions.push({ hairDamageLevel: damageLevel });
    }

    // Filter by curl type
    if (curlType) {
      whereConditions.push({ curlType });
    }

    // Filter by goal (partial match)
    if (goal) {
      whereConditions.push({ customerGoal: { contains: goal, mode: "insensitive" } });
    }

    // Filter by start date
    if (startDate) {
      whereConditions.push({
        createdAt: {
          gte: new Date(startDate + "T00:00:00.000Z")
        }
      });
    }

    // Filter by end date
    if (endDate) {
      whereConditions.push({
        createdAt: {
          lte: new Date(endDate + "T23:59:59.999Z")
        }
      });
    }

    try {
    try {
      // @ts-ignore - Model may not be generated yet
      const items = await prisma.stylistAnalysis.findMany({
        where: whereConditions.length > 0 ? { AND: whereConditions } : {},
        orderBy: {
          createdAt: "desc"
        }
      });

      return NextResponse.json(items);
    } catch (dbError: any) {
      // Return empty if model doesn't exist
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("Property 'stylistAnalysis'")) {
        return NextResponse.json([]);
      }
      throw dbError;
    }
    } catch (dbError: any) {
      // Return empty array if model doesn't exist yet
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("denied access")) {
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Load failed" }, { status: 500 });
  }
}

// Keep GET for backward compatibility (no filters)
export async function GET() {
  try {
    try {
      // @ts-ignore - Model may not be generated yet
      const items = await prisma.stylistAnalysis.findMany({
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(items);
    } catch (dbError: any) {
      // Return empty if model doesn't exist
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("Property 'stylistAnalysis'")) {
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Load failed" }, { status: 500 });
  }
}

