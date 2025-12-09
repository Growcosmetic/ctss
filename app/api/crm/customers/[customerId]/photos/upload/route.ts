import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/crm/customers/[customerId]/photos/upload - Upload photo file
export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const description = formData.get("description") as string | null;
    const uploadedBy = formData.get("uploadedBy") as string | null;

    if (!file) {
      return errorResponse("File is required", 400);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return errorResponse("File must be an image", 400);
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse("File size must be less than 10MB", 400);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "customer-photos", customerId);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${timestamp}_${randomStr}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL
    const imageUrl = `/uploads/customer-photos/${customerId}/${filename}`;

    // Save photo record to database via the photos API
    try {
      const saveResponse = await fetch(
        `${request.nextUrl.origin}/api/crm/customers/${customerId}/photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl,
            description,
            uploadedBy,
          }),
        }
      );

      const saveResult = await saveResponse.json();
      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save photo record");
      }

      return successResponse(saveResult.data, "Photo uploaded successfully");
    } catch (error: any) {
      // If database save fails, still return the file URL
      console.error("Error saving photo record:", error);
      return successResponse(
        {
          id: `temp-${timestamp}`,
          customerId,
          imageUrl,
          description,
          uploadedBy,
          createdAt: new Date(),
        },
        "Photo uploaded successfully (file saved, but database record may not be saved)"
      );
    }
  } catch (error: any) {
    console.error("Error uploading photo file:", error);
    return errorResponse(error.message || "Failed to upload photo", 500);
  }
}

