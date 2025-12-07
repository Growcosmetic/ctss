// ============================================
// Training - Dashboard Data Aggregation
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const branchId = searchParams.get("branchId");

    const where: any = {};
    if (staffId) {
      where.userId = staffId;
    }

    // Get all staff (or specific staff)
    const staffQuery: any = {};
    if (staffId) {
      staffQuery.id = staffId;
    }
    if (branchId) {
      staffQuery.branchId = branchId;
    }

    const staff = await prisma.user.findMany({
      where: staffQuery,
      select: {
        id: true,
        name: true,
        trainingRole: true,
        currentLevel: true,
        branchId: true,
      },
    });

    // Get skill assessments
    const assessmentWhere: any = {};
    if (staffId) {
      assessmentWhere.staffId = staffId;
    } else {
      assessmentWhere.staffId = {
        in: staff.map((s) => s.id),
      };
    }

    const assessments = await prisma.skillAssessment.findMany({
      where: assessmentWhere,
      orderBy: { createdAt: "desc" },
    });

    // Get training progress
    const progressWhere: any = {};
    if (staffId) {
      progressWhere.userId = staffId;
    } else {
      progressWhere.userId = {
        in: staff.map((s) => s.id),
      };
    }

    const progress = await prisma.trainingProgress.findMany({
      where: progressWhere,
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
        level: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get roleplay sessions
    const roleplayWhere: any = {};
    if (staffId) {
      roleplayWhere.userId = staffId;
    } else {
      roleplayWhere.userId = {
        in: staff.map((s) => s.id),
      };
    }

    const roleplays = await prisma.roleplaySession.findMany({
      where: roleplayWhere,
      orderBy: { createdAt: "desc" },
    });

    // Get certifications
    const certWhere: any = {};
    if (staffId) {
      certWhere.userId = staffId;
    } else {
      certWhere.userId = {
        in: staff.map((s) => s.id),
      };
    }

    const certifications = await prisma.certification.findMany({
      where: certWhere,
      include: {
        level: {
          include: {
            role: true,
          },
        },
      },
    });

    // Get modules for completion tracking
    const modules = await prisma.trainingModule.findMany({
      include: {
        lessons: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        staff,
        assessments,
        progress,
        roleplays,
        certifications,
        modules,
      },
    });
  } catch (err: any) {
    console.error("Dashboard data error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get dashboard data",
      },
      { status: 500 }
    );
  }
}

