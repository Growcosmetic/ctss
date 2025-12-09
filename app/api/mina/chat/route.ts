import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { buildAIPrompt } from "@/features/mina/bot/services/minaBrain";
import { CTSSRole } from "@/features/auth/types";
import { makeReply } from "@/features/mina/core/makeReply";
import { getOpenAIClientSafe } from "@/lib/ai/openai";

// Initialize OpenAI client
// Client initialized lazily via getClient()

// Simple token validation
function validateToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    return userId || null;
  } catch {
    return null;
  }
}

// POST /api/mina/chat
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return new Response("Not authenticated", { status: 401 });
    }

    const userId = validateToken(token);
    if (!userId) {
      return new Response("Invalid token", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return new Response("User not found or inactive", { status: 401 });
    }

    // Parse request
    const body = await request.json();
    const { userMessage, conversationId, context, payload } = body;

    if (!userMessage) {
      return new Response("userMessage is required", { status: 400 });
    }

    // Check for Stylist Mode first
    const stylistReply = await makeReply({
      message: userMessage,
      customerId: context?.customerId,
      payload: payload,
    });

    // If Stylist Mode response, return it directly
    if (stylistReply && !stylistReply.shouldUseAI) {
      // Get or create conversation for saving message
      let conversation;
      if (conversationId) {
        conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });
      }

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId: user.id,
          },
        });
      }

      // Save user message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "user",
          content: userMessage,
        },
      });

      // Save assistant message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: stylistReply.text,
        },
      });

      // Stream the stylist response
      const stream = new ReadableStream({
        start(controller) {
          // Send response in chunks for consistency with streaming format
          const chunks = stylistReply.text.match(/.{1,50}/g) || [stylistReply.text];
          
          chunks.forEach((chunk, index) => {
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          });

          // Send conversation ID
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ conversationId: conversation.id })}\n\n`
            )
          );
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20, // Last 20 messages
          },
        },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          messages: {
            create: [],
          },
        },
        include: {
          messages: true,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: userMessage,
      },
    });

    // Build AI prompt
    const conversationHistory = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const aiPrompt = await buildAIPrompt(userMessage, {
      userRole: user.role as CTSSRole,
      userId: user.id,
      customerId: context?.customerId,
      bookingId: context?.bookingId,
      invoiceId: context?.invoiceId,
      stylistId: context?.stylistId,
    }, conversationHistory);

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback: Return a simple response
      const fallbackResponse = "Xin lỗi, hệ thống AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
      
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: fallbackResponse,
        },
      });

      return new Response(
        JSON.stringify({
          conversationId: conversation.id,
          message: fallbackResponse,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Stream OpenAI response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await getClient().chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
              { role: "system", content: aiPrompt },
              { role: "user", content: userMessage },
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 1000,
          });

          let fullResponse = "";

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              const data = JSON.stringify({ content });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          }

          // Save assistant message
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: "assistant",
              content: fullResponse,
            },
          });

          // Send conversation ID before closing
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ conversationId: conversation.id })}\n\n`
            )
          );
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error: any) {
          console.error("OpenAI error:", error);
          const errorMessage = "Xin lỗi, em gặp lỗi khi xử lý. Vui lòng thử lại sau.";
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ content: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

