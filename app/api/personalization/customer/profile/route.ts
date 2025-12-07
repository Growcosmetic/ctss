// ============================================
// PHASE 31A - Customer Personality Profile
// ============================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { customerPersonalityPrompt } from "@/core/prompts/customerPersonalityPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function successResponse(data: any, message: string = "Success", status: number = 200) {
  return Response.json({ success: true, data, message }, { status });
}

function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// POST /api/personalization/customer/profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        bookings: {
          take: 20,
          orderBy: { date: "desc" },
          include: {
            service: true,
            staff: {
              include: {
                user: true,
              },
            },
          },
        },
        profile: true,
      },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    // Check if profile already exists
    const existing = await prisma.customerPersonalityProfile.findUnique({
      where: { customerId },
    });

    // Get additional data
    const feedback = await prisma.feedback?.findMany({
      where: { customerId },
      take: 10,
    }).catch(() => []);

    // Prepare data for AI
    const customerData = {
      bookings: customer.bookings,
      services: customer.bookings.map(b => b.service).filter(Boolean),
      feedback: feedback || [],
      interactions: [], // Would fetch from Mina interactions
    };

    // Generate prompt
    const prompt = customerPersonalityPrompt(customerData);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là AI chuyên phân tích tính cách và thẩm mỹ khách hàng. Phân tích chính xác và trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      return errorResponse("AI did not generate profile", 500);
    }

    // Parse JSON
    let profileData;
    try {
      const cleaned = rawOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      profileData = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("Failed to parse profile JSON:", parseError);
      return errorResponse("Failed to parse profile response", 500);
    }

    // Update or create profile
    const profile = await prisma.customerPersonalityProfile.upsert({
      where: { customerId },
      update: {
        curlPreference: profileData.curlPreference || null,
        lengthPreference: profileData.lengthPreference || null,
        stylePreference: profileData.stylePreference || null,
        colorPreference: profileData.colorPreference || [],
        colorTonePreference: profileData.colorTonePreference || null,
        colorIntensityPreference: profileData.colorIntensityPreference || null,
        styleVibe: profileData.styleVibe || [],
        personality: profileData.personality || null,
        hairCareHabits: profileData.hairCareHabits || [],
        lifestyle: profileData.lifestyle || null,
        communicationStyle: profileData.communicationStyle || null,
        followUpPreference: profileData.followUpPreference || null,
        personalitySummary: profileData.personalitySummary || null,
        aestheticProfile: profileData.aestheticProfile || null,
        preferencesScore: profileData.preferencesScore || null,
        interactionsCount: existing ? (existing.interactionsCount + 1) : 1,
      },
      create: {
        customerId,
        curlPreference: profileData.curlPreference || null,
        lengthPreference: profileData.lengthPreference || null,
        stylePreference: profileData.stylePreference || null,
        colorPreference: profileData.colorPreference || [],
        colorTonePreference: profileData.colorTonePreference || null,
        colorIntensityPreference: profileData.colorIntensityPreference || null,
        styleVibe: profileData.styleVibe || [],
        personality: profileData.personality || null,
        hairCareHabits: profileData.hairCareHabits || [],
        lifestyle: profileData.lifestyle || null,
        communicationStyle: profileData.communicationStyle || null,
        followUpPreference: profileData.followUpPreference || null,
        personalitySummary: profileData.personalitySummary || null,
        aestheticProfile: profileData.aestheticProfile || null,
        preferencesScore: profileData.preferencesScore || null,
        interactionsCount: 1,
      },
    });

    return successResponse(profile);
  } catch (error: any) {
    console.error("Error generating customer profile:", error);
    return errorResponse(error.message || "Failed to generate profile", 500);
  }
}

// GET /api/personalization/customer/profile/[customerId]
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return errorResponse("Customer ID is required", 400);
    }

    const profile = await prisma.customerPersonalityProfile.findUnique({
      where: { customerId },
    });

    if (!profile) {
      return errorResponse("Profile not found", 404);
    }

    return successResponse(profile);
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return errorResponse(error.message || "Failed to fetch profile", 500);
  }
}

