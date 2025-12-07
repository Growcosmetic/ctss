// ============================================
// PHASE 30 - Full Video Analysis (All in One)
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/hair-video/analyze/full - Run all analyses and generate recommendation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, generateRecommendation = true } = body;

    if (!videoId) {
      return errorResponse("Video ID is required", 400);
    }

    const video = await prisma.hairAnalysisVideo.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return errorResponse("Video not found", 404);
    }

    const results: any = {
      videoId,
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1. Run movement analysis
    try {
      const movementResponse = await fetch(`${baseUrl}/api/hair-video/analyze/movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const movementData = await movementResponse.json();
      results.movementAnalysis = movementData.data;
    } catch (error) {
      console.error("Movement analysis error:", error);
    }

    // 2. Run elasticity analysis
    try {
      const elasticityResponse = await fetch(`${baseUrl}/api/hair-video/analyze/elasticity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const elasticityData = await elasticityResponse.json();
      results.elasticityAnalysis = elasticityData.data;
    } catch (error) {
      console.error("Elasticity analysis error:", error);
    }

    // 3. Run surface analysis
    try {
      const surfaceResponse = await fetch(`${baseUrl}/api/hair-video/analyze/surface`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const surfaceData = await surfaceResponse.json();
      results.surfaceAnalysis = surfaceData.data;
    } catch (error) {
      console.error("Surface analysis error:", error);
    }

    // 4. Run damage mapping
    try {
      const damageResponse = await fetch(`${baseUrl}/api/hair-video/analyze/damage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const damageData = await damageResponse.json();
      results.damageMapping = damageData.data;
    } catch (error) {
      console.error("Damage mapping error:", error);
    }

    // 5. Generate recommendation if requested
    if (
      generateRecommendation &&
      results.movementAnalysis &&
      results.elasticityAnalysis &&
      results.surfaceAnalysis &&
      results.damageMapping
    ) {
      try {
        const recommendResponse = await fetch(`${baseUrl}/api/hair-video/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        const recommendData = await recommendResponse.json();
        results.recommendation = recommendData.data;
      } catch (error) {
        console.error("Recommendation generation error:", error);
      }
    }

    return successResponse(results, "Full video analysis completed");
  } catch (error: any) {
    console.error("Error in full video analysis:", error);
    return errorResponse(error.message || "Failed to complete full analysis", 500);
  }
}

