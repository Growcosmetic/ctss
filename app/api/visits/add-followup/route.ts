// ============================================
// Visit - Add Follow-up Notes
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { visitId, followUpNotes } = await req.json();

    if (!visitId || !followUpNotes) {
      return NextResponse.json(
        { error: "visitId and followUpNotes are required" },
        { status: 400 }
      );
    }

    // Get existing follow-up notes
    const existingVisit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: { followUpNotes: true },
    });

    // Append new follow-up note with timestamp
    const timestamp = new Date().toLocaleString("vi-VN");
    const newNote = `[${timestamp}] ${followUpNotes}`;
    const updatedNotes = existingVisit?.followUpNotes
      ? `${existingVisit.followUpNotes}\n\n${newNote}`
      : newNote;

    // Update visit
    const visit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        followUpNotes: updatedNotes,
      },
    });

    return NextResponse.json({
      success: true,
      visit,
    });
  } catch (err: any) {
    console.error("Add follow-up error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to add follow-up",
      },
      { status: 500 }
    );
  }
}

