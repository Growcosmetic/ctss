import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/settings/[key] - Get setting by key
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: params.key },
    });

    if (!setting) {
      return errorResponse("Setting not found", 404);
    }

    return successResponse(setting);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch setting", 500);
  }
}

// PUT /api/settings/[key] - Update setting by key
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const body = await request.json();
    const { value, type, category, description, updatedBy } = body;

    if (value === undefined) {
      return errorResponse("Value is required", 400);
    }

    const setting = await prisma.setting.update({
      where: { key: params.key },
      data: {
        value: String(value),
        type: type || "STRING",
        category,
        description,
        updatedBy: updatedBy || "system",
      },
    });

    return successResponse(setting, "Setting updated successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Setting not found", 404);
    }
    return errorResponse(error.message || "Failed to update setting", 500);
  }
}

// DELETE /api/settings/[key] - Delete setting by key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    await prisma.setting.delete({
      where: { key: params.key },
    });

    return successResponse(null, "Setting deleted successfully");
  } catch (error: any) {
    if (error.code === "P2025") {
      return errorResponse("Setting not found", 404);
    }
    return errorResponse(error.message || "Failed to delete setting", 500);
  }
}

