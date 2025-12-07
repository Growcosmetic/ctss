// ============================================
// PHASE 30A - Video Upload & Frame Extraction
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

// POST /api/hair-video/upload
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
    const videoFile = formData.get("video") as File;
    const videoType = (formData.get("videoType") as string) || "HAIR_ANALYSIS";
    const customerId = formData.get("customerId") as string | null;
    const branchId = formData.get("branchId") as string | null;
    const partnerId = formData.get("partnerId") as string | null;
    const bookingId = formData.get("bookingId") as string | null;

    if (!videoFile) {
      return errorResponse("Video file is required", 400);
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll just save metadata
    // You would typically:
    // 1. Upload videoFile to storage
    // 2. Get public URL
    // 3. Extract frames (30-60 frames for 3-5 second video)
    // 4. Generate thumbnail
    
    // Placeholder: In production, replace with actual upload logic
    const videoUrl = `https://storage.example.com/videos/${Date.now()}_${videoFile.name}`;
    const thumbnailUrl = `https://storage.example.com/thumbnails/${Date.now()}_${videoFile.name}.jpg`;

    // Estimate video metadata (in production, extract from actual video)
    const estimatedDuration = 3.5; // seconds (example)
    const estimatedFPS = 30;
    const estimatedFrameCount = Math.floor(estimatedDuration * estimatedFPS);

    // Create video record
    const video = await prisma.hairAnalysisVideo.create({
      data: {
        videoUrl,
        thumbnailUrl,
        videoType,
        duration: estimatedDuration,
        frameCount: estimatedFrameCount,
        fps: estimatedFPS,
        resolution: "1920x1080", // Example
        fileSize: videoFile.size,
        mimeType: videoFile.type,
        customerId: customerId || null,
        staffId: userId,
        branchId: branchId || user.branchId || null,
        partnerId: partnerId || user.partnerId || null,
        bookingId: bookingId || null,
        originalFileName: videoFile.name,
      },
    });

    // In production, extract frames here
    // For now, create placeholder frames
    // Example: Extract 30 frames evenly spaced throughout video
    const framesToExtract = Math.min(estimatedFrameCount, 60); // Max 60 frames
    const frameInterval = estimatedDuration / framesToExtract;

    const frames = [];
    for (let i = 0; i < framesToExtract; i++) {
      const timestamp = i * frameInterval;
      const frameNumber = i + 1;
      
      // In production, extract actual frame image
      const frameImageUrl = `https://storage.example.com/frames/${video.id}_frame_${frameNumber}.jpg`;
      
      frames.push({
        videoId: video.id,
        frameNumber,
        timestamp,
        imageUrl: frameImageUrl,
        analyzed: false,
      });
    }

    // Bulk create frames
    await prisma.videoFrame.createMany({
      data: frames,
    });

    return successResponse({
      ...video,
      framesExtracted: frames.length,
    }, "Video uploaded and frames extracted", 201);
  } catch (error: any) {
    console.error("Error uploading video:", error);
    return errorResponse(error.message || "Failed to upload video", 500);
  }
}

