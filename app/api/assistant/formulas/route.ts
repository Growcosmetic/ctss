// ============================================
// Assistant Formulas - Get mixing formulas
// ============================================

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Read formulas data from JSON file
const formulasData = JSON.parse(
  readFileSync(
    join(process.cwd(), "core", "data", "mixingFormulas.json"),
    "utf-8"
  )
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get("serviceType");
    const id = searchParams.get("id");

    let formulas = formulasData;

    if (id) {
      // Get specific formula
      const formula = formulasData.find((f: any) => f.id === id);
      if (!formula) {
        return NextResponse.json(
          { error: "Formula not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        formula,
      });
    }

    if (serviceType) {
      // Filter by service type
      formulas = formulasData.filter(
        (f: any) => f.serviceType === serviceType
      );
    }

    return NextResponse.json({
      success: true,
      formulas,
      total: formulas.length,
    });
  } catch (err: any) {
    console.error("Get formulas error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get formulas",
      },
      { status: 500 }
    );
  }
}

