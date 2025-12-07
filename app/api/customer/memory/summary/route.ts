// ============================================
// Customer Memory Summary API
// ============================================

import { NextResponse } from "next/server";
import { getCustomerMemorySummary } from "@/core/customerJourney/memoryService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    const result = await getCustomerMemorySummary(customerId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Memory summary API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get memory summary" },
      { status: 500 }
    );
  }
}

