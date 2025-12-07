// ============================================
// PHASE 31D - Mina Memory Engine
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/personalization/memory - Create or update memory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      memoryType,
      category,
      key,
      value,
      details,
      source,
      sourceId,
      confidence = 0.5,
    } = body;

    if (!customerId || !memoryType || !key) {
      return errorResponse("Customer ID, memory type, and key are required", 400);
    }

    // Check if memory exists
    const existing = await prisma.minaMemory.findFirst({
      where: {
        customerId,
        key,
      },
    });

    let memory;
    if (existing) {
      // Update existing memory and increase confidence
      const newConfidence = Math.min(1.0, existing.confidence + 0.1);
      const newConfirmedCount = existing.confirmedCount + 1;

      memory = await prisma.minaMemory.update({
        where: { id: existing.id },
        data: {
          value: value || existing.value,
          details: details || existing.details,
          confidence: newConfidence,
          confirmedCount: newConfirmedCount,
          lastUsed: new Date(),
          usageCount: existing.usageCount + 1,
        },
      });
    } else {
      // Create new memory
      memory = await prisma.minaMemory.create({
        data: {
          customerId,
          memoryType,
          category: category || null,
          key,
          value: value || null,
          details: details || null,
          source: source || null,
          sourceId: sourceId || null,
          confidence,
          confirmedCount: 1,
          lastUsed: new Date(),
        },
      });
    }

    return successResponse(memory, existing ? "Memory updated" : "Memory created");
  } catch (error: any) {
    console.error("Error managing memory:", error);
    return errorResponse(error.message || "Failed to manage memory", 500);
  }
}

// GET /api/personalization/memory/[customerId]
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const category = searchParams.get("category");
    const memoryType = searchParams.get("memoryType");

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    const where: any = { customerId };
    if (category) where.category = category;
    if (memoryType) where.memoryType = memoryType;

    const memories = await prisma.minaMemory.findMany({
      where,
      orderBy: [
        { confidence: "desc" },
        { lastUsed: "desc" },
      ],
    });

    return successResponse(memories);
  } catch (error: any) {
    console.error("Error fetching memories:", error);
    return errorResponse(error.message || "Failed to fetch memories", 500);
  }
}


