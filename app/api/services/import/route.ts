// ============================================
// Services - Import Services from Excel
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/services/import
// Import services from Excel data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { services, overwrite } = body;

    if (!Array.isArray(services) || services.length === 0) {
      return errorResponse("services must be a non-empty array", 400);
    }

    try {
      const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (const serviceData of services) {
        try {
          const {
            name,
            code,
            category,
            description,
            englishName,
            englishDescription,
            price,
            duration,
            isActive,
          } = serviceData;

          if (!name || !category) {
            results.skipped++;
            results.errors.push(
              `Dịch vụ thiếu tên hoặc nhóm: ${name || category}`
            );
            continue;
          }

          // Check if service exists (by code if provided, otherwise by name+category)
          let existing = null;
          if (code) {
            existing = await prisma.service.findFirst({
              where: { code },
            });
          }
          if (!existing) {
            existing = await prisma.service.findFirst({
              where: {
                name: { equals: name, mode: "insensitive" },
                category: { equals: category, mode: "insensitive" },
              },
            });
          }

          if (existing) {
            if (!overwrite) {
              results.skipped++;
              continue;
            }

            // Update existing service
            const updated = await prisma.service.update({
              where: { id: existing.id },
              data: {
                name,
                code: code || existing.code,
                category,
                description: description || existing.description,
                englishName: englishName || existing.englishName,
                englishDescription:
                  englishDescription || existing.englishDescription,
                price: price !== undefined ? parseInt(String(price)) : existing.price,
                duration:
                  duration !== undefined
                    ? parseInt(String(duration))
                    : existing.duration,
                isActive:
                  isActive !== undefined ? isActive : existing.isActive,
              },
            });
            results.updated++;
          } else {
            // Create new service
            const created = await prisma.service.create({
              data: {
                name,
                code: code || null,
                category,
                description: description || null,
                englishName: englishName || null,
                englishDescription: englishDescription || null,
                price: parseInt(String(price)) || 0,
                duration: parseInt(String(duration)) || 30,
                isActive: isActive !== undefined ? isActive : true,
              },
            });
            results.created++;
          }
        } catch (err: any) {
          results.skipped++;
          results.errors.push(
            `Lỗi khi xử lý dịch vụ "${serviceData.name}": ${err.message}`
          );
        }
      }

      return successResponse({
        ...results,
        total: services.length,
      });
    } catch (err: any) {
      console.error("Import services error:", err);
      return errorResponse(
        `Failed to import services: ${err.message}`,
        500
      );
    }
  } catch (err: any) {
    console.error("Import services request error:", err);
    return errorResponse(
      `Invalid request: ${err.message}`,
      400
    );
  }
}
