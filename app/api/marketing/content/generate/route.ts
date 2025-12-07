// ============================================
// Marketing Content - Generate content (AI)
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contentGeneratorPrompt } from "@/core/prompts/contentGeneratorPrompt";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const {
      contentType,
      campaignId,
      service,
      targetAudience,
      platform,
      tone,
      count = 1,
    } = await req.json();

    if (!contentType) {
      return NextResponse.json(
        { error: "contentType is required" },
        { status: 400 }
      );
    }

    const validTypes = ["POST", "AD", "REEL", "SCRIPT", "IMAGE_PROMPT"];
    if (!validTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid contentType" },
        { status: 400 }
      );
    }

    // Get campaign info if provided
    let campaign = null;
    if (campaignId) {
      campaign = await prisma.marketingCampaignV2.findUnique({
        where: { id: campaignId },
        include: {
          channel: true,
        },
      });
    }

    const contents = [];

    for (let i = 0; i < count; i++) {
      // AI Content Generation
      const prompt = contentGeneratorPrompt({
        contentType,
        service: service || campaign?.name || undefined,
        campaign: campaign?.name || undefined,
        targetAudience: targetAudience || campaign?.targetSegment || undefined,
        platform: platform || campaign?.channel?.name || undefined,
        tone,
      });

      let generatedContent;
      try {
        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Bạn là AI Marketing Content Creator chuyên nghiệp cho salon. Tạo nội dung chất lượng, thu hút, phù hợp với đối tượng. Trả về JSON hợp lệ.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.8,
          response_format: { type: "json_object" },
        });

        const rawOutput = completion.choices[0]?.message?.content;
        if (rawOutput) {
          generatedContent = JSON.parse(rawOutput);
        }
      } catch (aiError) {
        console.error("AI content generation error:", aiError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to generate content",
          },
          { status: 500 }
        );
      }

      // Create content record
      let contentText = "";
      let hashtags: string[] = [];
      let imagePrompt = null;

      if (contentType === "POST") {
        contentText = `${generatedContent.title || ""}\n\n${generatedContent.content || ""}`;
        hashtags = generatedContent.hashtags || [];
        imagePrompt = generatedContent.imagePrompt || null;
      } else if (contentType === "AD" || contentType === "SCRIPT") {
        contentText = `${generatedContent.hook || ""}\n\n${generatedContent.body || ""}\n\n${generatedContent.cta || ""}`;
        hashtags = generatedContent.hashtags || [];
      } else if (contentType === "REEL") {
        contentText = JSON.stringify(generatedContent.script || []);
        hashtags = generatedContent.hashtags || [];
      } else if (contentType === "IMAGE_PROMPT") {
        imagePrompt = generatedContent.prompt || null;
        contentText = generatedContent.prompt || "";
      }

      const content = await prisma.marketingContent.create({
        data: {
          campaignId: campaignId || null,
          contentType,
          title: contentType === "POST" ? generatedContent.title : null,
          content: contentText,
          imagePrompt,
          hashtags,
          platform: platform || campaign?.channel?.name || null,
          isAIGenerated: true,
          aiModel: "gpt-4o-mini",
          generationPrompt: prompt,
        },
      });

      contents.push({
        ...content,
        generatedData: generatedContent,
      });
    }

    return NextResponse.json({
      success: true,
      contents,
      count: contents.length,
    });
  } catch (err: any) {
    console.error("Generate content error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate content",
      },
      { status: 500 }
    );
  }
}

// Get contents
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const contentType = searchParams.get("contentType");
    const platform = searchParams.get("platform");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (contentType) where.contentType = contentType;
    if (platform) where.platform = platform;

    const contents = await prisma.marketingContent.findMany({
      where,
      include: {
        campaign: {
          include: {
            channel: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      contents,
      total: contents.length,
    });
  } catch (err: any) {
    console.error("Get contents error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get contents",
      },
      { status: 500 }
    );
  }
}

