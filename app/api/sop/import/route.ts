// ============================================
// SOP - Import SOPs from JSON
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sops, overwrite } = body; // sops is array of SOP objects

    if (!sops || !Array.isArray(sops)) {
      return NextResponse.json(
        { error: "sops must be an array" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const sop of sops) {
      try {
        // Validate required fields
        if (!sop.step || !sop.title || !sop.role || !sop.detail) {
          errors.push({
            sop,
            error: "Missing required fields: step, title, role, detail",
          });
          continue;
        }

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
            results.push({ action: "updated", sop: updated });
          } else {
            // Skip existing
            results.push({ action: "skipped", sop: existing, reason: "Already exists" });
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
          results.push({ action: "created", sop: created });
        }
      } catch (err: any) {
        errors.push({
          sop,
          error: err.message || "Failed to import SOP",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("Import SOPs error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to import SOPs",
      },
      { status: 500 }
    );
  }
}

