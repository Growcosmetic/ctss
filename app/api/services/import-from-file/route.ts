// ============================================
// Services - Import Services from Excel file in public folder
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { readFileSync } from "fs";
import { join } from "path";
import * as XLSX from "xlsx";

// POST /api/services/import-from-file
// Import services from Excel file in public folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, overwrite } = body;

    if (!filename) {
      return errorResponse("filename is required", 400);
    }

    // Read Excel file from public folder
    const filePath = join(process.cwd(), "public", filename);
    
    let workbook;
    try {
      const fileBuffer = readFileSync(filePath);
      workbook = XLSX.read(fileBuffer, { type: "buffer" });
    } catch (err: any) {
      return errorResponse(`Cannot read file: ${err.message}`, 400);
    }

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Try reading with header on row 2 (row 1 is title "DANH SÁCH DỊCH VỤ")
    // First, try reading as array to see structure
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: "",
      blankrows: false,
      header: 1, // Read as array of arrays
    });

    // Find header row (usually row 2, index 1)
    let headerRowIndex = 1; // Default to row 2
    if (rawData.length > 1) {
      // Check if row 1 looks like a header
      const row1 = rawData[0] as any[];
      const row2 = rawData[1] as any[];
      
      // If row 1 contains "DANH SÁCH" or similar, use row 2 as header
      if (row1 && row1.some((cell: any) => String(cell).toUpperCase().includes("DANH SÁCH"))) {
        headerRowIndex = 1; // Use row 2 (index 1) as header
      } else {
        headerRowIndex = 0; // Use row 1 as header
      }
    }

    // Convert to JSON with proper header
    let jsonData;
    if (headerRowIndex === 1 && rawData.length > 1) {
      // Use row 2 as header, skip row 1
      const headers = rawData[1] as any[];
      jsonData = rawData.slice(2).map((row: any) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          if (header) {
            obj[String(header).trim()] = row[index] || "";
          }
        });
        return obj;
      });
    } else {
      // Use default method
      jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: "",
        blankrows: false,
      });
    }

    if (!jsonData || jsonData.length === 0) {
      return errorResponse("File không có dữ liệu", 400);
    }

    // Debug: Log first few rows to understand structure
    console.log("Total rows:", jsonData.length);
    if (jsonData.length > 0) {
      console.log("First row keys:", Object.keys(jsonData[0]));
      console.log("First row sample:", JSON.stringify(jsonData[0], null, 2));
      if (jsonData.length > 1) {
        console.log("Second row sample:", JSON.stringify(jsonData[1], null, 2));
      }
      if (jsonData.length > 2) {
        console.log("Third row sample:", JSON.stringify(jsonData[2], null, 2));
      }
    }

    // Helper function to parse price
    const parsePrice = (priceStr: string): number => {
      if (!priceStr || priceStr.trim() === "") return 0;
      const cleaned = String(priceStr)
        .replace(/\./g, "")
        .replace(/,/g, "")
        .replace(/\s/g, "")
        .replace(/[^\d-]/g, "");
      return parseInt(cleaned) || 0;
    };

    // Helper function to parse duration
    const parseDuration = (durationStr: string): number => {
      if (!durationStr || durationStr.trim() === "") return 30;
      const cleaned = String(durationStr).replace(/\D/g, "");
      return parseInt(cleaned) || 30;
    };

    // Helper function to get value from row
    const getValue = (row: any, keys: string[]): string => {
      const rowKeys = Object.keys(row).map((k) => k.toLowerCase());
      for (const key of keys) {
        // Try exact match first
        if (
          row[key] !== undefined &&
          row[key] !== null &&
          String(row[key]).trim() !== ""
        ) {
          return String(row[key]).trim();
        }
        // Try case-insensitive match
        const foundKey = rowKeys.find((k) => k === key.toLowerCase());
        if (
          foundKey &&
          row[foundKey] !== undefined &&
          row[foundKey] !== null &&
          String(row[foundKey]).trim() !== ""
        ) {
          return String(row[foundKey]).trim();
        }
      }
      return "";
    };

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Debug: Log first row to see structure
    if (jsonData.length > 0) {
      console.log("First row keys:", Object.keys(jsonData[0]));
      console.log("First row sample:", JSON.stringify(jsonData[0], null, 2));
    }

    // Process each row
    for (const row of jsonData as any[]) {
      try {
        // Try multiple variations of column names
        const name = getValue(row, [
          "Tên dịch vụ",
          "tên dịch vụ",
          "Tên Dịch Vụ",
          "TEN DICH VU",
          "ten dich vu",
          "name",
          "service name",
          "Service Name",
          "Tên dịch vụ",
          "Tên dịch vụ ",
          "__EMPTY", // Sometimes Excel uses this for first column
        ]);
        const code = getValue(row, [
          "Mã dịch vụ",
          "mã dịch vụ",
          "Mã Dịch Vụ",
          "MA DICH VU",
          "ma dich vu",
          "code",
          "service code",
          "Service Code",
          "Mã dịch vụ",
          "Mã dịch vụ ",
        ]);
        const category = getValue(row, [
          "Nhóm dịch vụ",
          "nhóm dịch vụ",
          "Nhóm Dịch Vụ",
          "NHOM DICH VU",
          "nhom dich vu",
          "category",
          "group",
          "Nhóm dịch vụ",
          "Nhóm dịch vụ ",
          "Nhom dịch vụ",
        ]);
        const description = getValue(row, [
          "mô tả",
          "mo ta",
          "description",
          "Mô tả",
        ]);
        const priceStr = getValue(row, [
          "giá dịch vụ",
          "gia dich vu",
          "price",
          "service price",
          "Giá dịch vụ",
        ]);
        const durationStr = getValue(row, [
          "thời gian phục vụ (phút)",
          "thoi gian phuc vu (phut)",
          "duration",
          "time",
          "Thời gian phục vụ (phút)",
        ]);
        const englishName = getValue(row, [
          "tên tiếng anh (nếu có)",
          "ten tieng anh (neu co)",
          "english name",
          "Tên tiếng Anh (nếu có)",
        ]);
        const englishDescription = getValue(row, [
          "mô tả bằng tiếng anh (nếu có)",
          "mo ta bang tieng anh (neu co)",
          "english description",
          "Mô tả bằng Tiếng Anh (nếu có)",
        ]);

        // Skip if missing required fields
        if (!name || !category) {
          // Only log first few errors to avoid spam
          if (results.errors.length < 3) {
            results.errors.push(
              `Dòng thiếu tên hoặc nhóm dịch vụ. Tên: "${name}", Nhóm: "${category}". Keys: ${Object.keys(row).join(", ")}. Sample: ${JSON.stringify(row)}`
            );
          }
          results.skipped++;
          continue;
        }

        // Check if service exists
        let existing = null;
        if (code) {
          try {
            existing = await prisma.service.findFirst({
              where: { code },
            });
          } catch (err: any) {
            // If code field doesn't exist in Prisma yet, skip code check
            console.warn("Code field check failed, using name+category:", err.message);
          }
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
          await prisma.service.update({
            where: { id: existing.id },
            data: {
              name,
              code: code || existing.code,
              category,
              description: description || existing.description,
              englishName: englishName || existing.englishName,
              englishDescription:
                englishDescription || existing.englishDescription,
              price: parsePrice(priceStr) || existing.price,
              duration: parseDuration(durationStr) || existing.duration,
              isActive: existing.isActive,
            },
          });
          results.updated++;
        } else {
          // Create new service - only include fields that exist in schema
          const serviceData: any = {
            name,
            category,
            price: parsePrice(priceStr) || 0,
            duration: parseDuration(durationStr) || 30,
          };
          
          // Only add optional fields if they exist and have values
          if (code && code.trim()) serviceData.code = code.trim();
          if (description && description.trim()) serviceData.description = description.trim();
          if (englishName && englishName.trim()) serviceData.englishName = englishName.trim();
          if (englishDescription && englishDescription.trim()) serviceData.englishDescription = englishDescription.trim();
          
          await prisma.service.create({
            data: serviceData,
          });
          results.created++;
        }
      } catch (err: any) {
        results.skipped++;
        results.errors.push(
          `Lỗi khi xử lý dòng: ${err.message}`
        );
      }
    }

    return successResponse({
      ...results,
      total: jsonData.length,
    });
  } catch (err: any) {
    console.error("Import from file error:", err);
    return errorResponse(`Failed to import: ${err.message}`, 500);
  }
}
