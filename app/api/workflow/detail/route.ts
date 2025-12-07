import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const item = await prisma.workflowRun.findUnique({
      where: { id }
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (err) {
    console.error("Workflow detail error:", err);
    return NextResponse.json({ error: "Not found" }, { status: 500 });
  }
}

