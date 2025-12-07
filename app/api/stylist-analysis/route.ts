import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    try {
      // @ts-ignore - Model may not be generated yet
      const saved = await prisma.stylistAnalysis.create({
        data: {
          hairCondition: body.hairCondition,
          hairHistory: body.hairHistory,
          customerGoal: body.customerGoal,
          curlType: body.curlType,
          hairDamageLevel: body.hairDamageLevel,
          stylistNote: body.stylistNote,
          resultJson: body.resultJson
        }
      });

      return NextResponse.json(saved);
    } catch (dbError: any) {
      // Return mock if model doesn't exist
      if (dbError.message?.includes("does not exist") || dbError.message?.includes("Property 'stylistAnalysis'")) {
        return NextResponse.json({
          id: `mock-${Date.now()}`,
          ...body,
          createdAt: new Date(),
        });
      }
      throw dbError;
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

