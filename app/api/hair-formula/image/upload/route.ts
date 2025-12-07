// ============================================
// PHASE 29 - Image Upload for Formula Generation
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

function validateToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

// POST /api/hair-formula/image/upload
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    const userId = validateToken(token);
    if (!userId) {
      return errorResponse("Invalid token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const imageType = (formData.get("imageType") as string) || "HAIR_STYLE";
    const customerId = formData.get("customerId") as string | null;
    const branchId = formData.get("branchId") as string | null;
    const partnerId = formData.get("partnerId") as string | null;

    if (!imageFile) {
      return errorResponse("Image file is required", 400);
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll just save metadata
    // You would typically:
    // 1. Upload imageFile to storage
    // 2. Get public URL
    // 3. Generate thumbnail
    
    // Placeholder: In production, replace with actual upload logic
    const imageUrl = `https://storage.example.com/images/${Date.now()}_${imageFile.name}`;
    const thumbnailUrl = `https://storage.example.com/thumbnails/${Date.now()}_${imageFile.name}`;

    // Create image record
    const image = await prisma.hairStyleImage.create({
      data: {
        imageUrl,
        thumbnailUrl,
        imageType,
        customerId: customerId || null,
        staffId: userId,
        branchId: branchId || user.branchId || null,
        partnerId: partnerId || user.partnerId || null,
        originalFileName: imageFile.name,
        fileSize: imageFile.size,
        mimeType: imageFile.type,
      },
    });

    return successResponse(image, "Image uploaded successfully", 201);
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return errorResponse(error.message || "Failed to upload image", 500);
  }
}

