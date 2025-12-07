// ============================================
// SOP - Import Assistant SOPs (Pre-configured)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFileSync } from "fs";
import { join } from "path";

// Read assistant SOPs from JSON file
const assistantSOPs = JSON.parse(
  readFileSync(
    join(process.cwd(), "core", "data", "assistantSOP.json"),
    "utf-8"
  )
);

export async function POST(req: Request) {
  try {
    const { overwrite } = await req.json().catch(() => ({}));

    const results = [];
    const errors = [];

    for (const sop of assistantSOPs) {
      try {
        // Check if SOP already exists
        const existing = await prisma.sOP.findFirst({
          where: {
            step: sop.step,
            role: sop.role,
          },
        });

        if (existing) {
          if (overwrite) {
            // Update existing
            const updated = await prisma.sOP.update({
              where: { id: existing.id },
              data: {
                title: sop.title,
                detail: sop.detail,
              },
            });
            results.push({ action: "updated", step: sop.step, sop: updated });
          } else {
            results.push({
              action: "skipped",
              step: sop.step,
              reason: "Already exists",
            });
          }
        } else {
          // Create new
          const created = await prisma.sOP.create({
            data: {
              step: sop.step,
              title: sop.title,
              detail: sop.detail,
              role: sop.role,
            },
          });
          results.push({ action: "created", step: sop.step, sop: created });
        }
      } catch (err: any) {
        errors.push({
          step: sop.step,
          error: err.message || "Failed to import SOP",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.filter((r) => r.action === "created").length} new SOPs, updated ${results.filter((r) => r.action === "updated").length} SOPs`,
      imported: results.filter((r) => r.action === "created").length,
      updated: results.filter((r) => r.action === "updated").length,
      skipped: results.filter((r) => r.action === "skipped").length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("Import assistant SOPs error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to import assistant SOPs",
      },
      { status: 500 }
    );
  }
}

