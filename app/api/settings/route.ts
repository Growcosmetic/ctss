import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/settings - Get all settings or by category
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const key = searchParams.get("key");

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (key) {
      where.key = key;
    }

    const settings = await prisma.setting.findMany({
      where,
      orderBy: { category: "asc" },
    });

    // Group by category if no specific category requested
    if (!category && !key) {
      const grouped = settings.reduce((acc: any, setting) => {
        const cat = setting.category || "general";
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push(setting);
        return acc;
      }, {});

      return successResponse(grouped);
    }

    return successResponse(settings);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch settings", 500);
  }
}

// POST /api/settings - Create or update a setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, type, category, description, updatedBy } = body;

    if (!key || value === undefined) {
      return errorResponse("Key and value are required", 400);
    }

    // Upsert setting
    const setting = await prisma.setting.upsert({
      where: { key },
      update: {
        value: String(value),
        type: type || "STRING",
        category,
        description,
        updatedBy: updatedBy || "system",
      },
      create: {
        key,
        value: String(value),
        type: type || "STRING",
        category: category || "general",
        description,
        updatedBy: updatedBy || "system",
      },
    });

    return successResponse(setting, "Setting saved successfully", 201);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to save setting", 500);
  }
}

// PUT /api/settings - Bulk update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings, updatedBy } = body;

    if (!Array.isArray(settings)) {
      return errorResponse("Settings must be an array", 400);
    }

    const results = await Promise.all(
      settings.map((setting: any) =>
        prisma.setting.upsert({
          where: { key: setting.key },
          update: {
            value: String(setting.value),
            type: setting.type || "STRING",
            category: setting.category,
            description: setting.description,
            updatedBy: updatedBy || "system",
          },
          create: {
            key: setting.key,
            value: String(setting.value),
            type: setting.type || "STRING",
            category: setting.category || "general",
            description: setting.description,
            updatedBy: updatedBy || "system",
          },
        })
      )
    );

    return successResponse(results, "Settings updated successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update settings", 500);
  }
}

