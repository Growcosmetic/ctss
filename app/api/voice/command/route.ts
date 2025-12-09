// ============================================
// PHASE 28F - Salon Intercom Mode (Voice Commands)
// ============================================

import { NextRequest } from "next/server";

// Lazy initialize OpenAI client
function getClient() {
  return getOpenAIClientSafe();
}
import { prisma } from "@/lib/prisma";
import { getOpenAIClientSafe } from "@/lib/ai/openai";
import { cookies } from "next/headers";

// Client initialized lazily via getClient()

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

// POST /api/voice/command - Process voice command from stylist
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

    const body = await request.json();
    const { transcript, audioUrl, branchId } = body;

    if (!transcript) {
      return errorResponse("Transcript is required", 400);
    }

    // Detect command type and parameters
    const commandPrompt = `
Bạn phân tích lệnh bằng giọng nói từ stylist tại salon.

LỆNH: "${transcript}"

XÁC ĐỊNH:
1. COMMAND_TYPE (một trong các loại sau):
   - CHECK_SCHEDULE: Kiểm tra lịch làm việc
   - VIEW_CUSTOMER: Xem thông tin khách hàng
   - OPEN_SOP: Mở SOP/d quy trình
   - CREATE_PROFILE: Tạo hồ sơ khách mới
   - ADD_NOTE: Thêm ghi chú cho khách
   - CHECK_INVENTORY: Kiểm tra tồn kho
   - VIEW_STYLIST_SCHEDULE: Xem lịch stylist cụ thể
   - VIEW_BOOKING_DETAILS: Xem chi tiết booking
   - OTHER: Lệnh khác

2. PARAMETERS (thông tin trích xuất):
   - stylistName: Tên stylist
   - customerName: Tên khách
   - customerPhone: Số điện thoại
   - date: Ngày/thứ
   - service: Dịch vụ
   - sopType: Loại SOP

TRẢ VỀ JSON:
{
  "commandType": "CHECK_SCHEDULE",
  "parameters": {
    "stylistName": "Hải",
    "date": "thứ 7"
  },
  "confidence": 0.95
}
`;

    const commandCompletion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Bạn là AI phân tích lệnh bằng giọng nói. Trả về JSON hợp lệ.",
        },
        { role: "user", content: commandPrompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const commandData = JSON.parse(
      commandCompletion.choices[0]?.message?.content || "{}"
    );

    // Create command record
    const command = await prisma.voiceCommand.create({
      data: {
        staffId: userId,
        branchId: branchId || user.branchId || null,
        transcript,
        audioUrl: audioUrl || null,
        commandType: commandData.commandType || "OTHER",
        parameters: commandData.parameters || {},
        intent: commandData.commandType || "OTHER",
        status: "PROCESSING",
      },
    });

    // Execute command based on type
    let result: any = {};
    let responseText = "";
    let error = null;

    try {
      switch (commandData.commandType) {
        case "CHECK_SCHEDULE": {
          const stylistName = commandData.parameters?.stylistName;
          const date = commandData.parameters?.date;

          // Find stylist
          let staffId = null;
          if (stylistName) {
            const staff = await prisma.user.findFirst({
              where: {
                name: {
                  contains: stylistName,
                  mode: "insensitive",
                },
              },
            });
            staffId = staff?.id || null;
          }

          // Get bookings
          const bookings = await prisma.booking.findMany({
            where: {
              ...(staffId ? { staffId } : {}),
              ...(date ? {
                date: {
                  // You'd parse the date here
                },
              } : {}),
            },
            include: {
              customer: true,
              service: true,
            },
            take: 10,
          });

          result = { bookings };
          responseText = `Em tìm thấy ${bookings.length} lịch hẹn${stylistName ? ` của ${stylistName}` : ""}${date ? ` vào ${date}` : ""}.`;
          break;
        }

        case "VIEW_CUSTOMER": {
          const customerName = commandData.parameters?.customerName;
          const customerPhone = commandData.parameters?.customerPhone;

          if (!customerName && !customerPhone) {
            throw new Error("Cần tên hoặc số điện thoại khách hàng");
          }

          const customer = await prisma.customer.findFirst({
            where: {
              ...(customerName ? {
                name: {
                  contains: customerName,
                  mode: "insensitive",
                },
              } : {}),
              ...(customerPhone ? { phone: customerPhone } : {}),
            },
            include: {
              bookings: { take: 5, orderBy: { date: "desc" } },
              profile: true,
            },
          });

          if (!customer) {
            throw new Error("Không tìm thấy khách hàng");
          }

          result = { customer };
          responseText = `Khách hàng ${customer.name}, số điện thoại ${customer.phone}, đã có ${customer.bookings.length} lịch hẹn.`;
          break;
        }

        case "OPEN_SOP": {
          const sopType = commandData.parameters?.sopType || commandData.parameters?.service;

          const sops = await prisma.serviceSOP.findMany({
            where: {
              ...(sopType ? {
                OR: [
                  { serviceName: { contains: sopType, mode: "insensitive" } },
                  { title: { contains: sopType, mode: "insensitive" } },
                ],
              } : {}),
            },
            take: 5,
          });

          result = { sops };
          responseText = `Em tìm thấy ${sops.length} SOP${sopType ? ` về ${sopType}` : ""}.`;
          break;
        }

        case "CREATE_PROFILE": {
          const customerName = commandData.parameters?.customerName;
          const customerPhone = commandData.parameters?.customerPhone;

          if (!customerName || !customerPhone) {
            throw new Error("Cần tên và số điện thoại khách hàng");
          }

          // Check if customer exists
          const existing = await prisma.customer.findFirst({
            where: { phone: customerPhone },
          });

          if (existing) {
            throw new Error("Khách hàng đã tồn tại");
          }

          const customer = await prisma.customer.create({
            data: {
              name: customerName,
              phone: customerPhone,
            },
          });

          result = { customer };
          responseText = `Đã tạo hồ sơ khách hàng ${customerName} thành công.`;
          break;
        }

        case "ADD_NOTE": {
          const customerName = commandData.parameters?.customerName;
          const note = transcript;

          if (!customerName) {
            throw new Error("Cần tên khách hàng");
          }

          const customer = await prisma.customer.findFirst({
            where: {
              name: {
                contains: customerName,
                mode: "insensitive",
              },
            },
          });

          if (!customer) {
            throw new Error("Không tìm thấy khách hàng");
          }

          // Add note to customer profile
          // This would depend on your customer note structure
          result = { customerId: customer.id };
          responseText = `Đã thêm ghi chú cho khách hàng ${customerName}.`;
          break;
        }

        default:
          responseText = "Em hiểu lệnh của anh/chị, nhưng chức năng này đang được phát triển.";
      }
    } catch (execError: any) {
      error = execError.message;
      responseText = `Lỗi: ${error}`;
    }

    // Generate audio response
    let responseAudio = null;
    try {
      const audio = await getClient().audio.speech.create({
        model: "tts-1-hd",
        voice: "nova",
        input: responseText,
        speed: 1.0,
      });
      responseAudio = Buffer.from(await audio.arrayBuffer()).toString("base64");
    } catch (audioError) {
      console.error("Error generating audio:", audioError);
    }

    // Update command with result
    await prisma.voiceCommand.update({
      where: { id: command.id },
      data: {
        status: error ? "FAILED" : "COMPLETED",
        result: result,
        error: error,
        responseText: responseText,
        responseAudioUrl: null, // Would be storage URL in production
        executedAt: new Date(),
      },
    });

    return successResponse({
      commandId: command.id,
      commandType: commandData.commandType,
      responseText,
      responseAudio,
      result,
      error,
    });
  } catch (error: any) {
    console.error("Error processing voice command:", error);
    return errorResponse(error.message || "Failed to process command", 500);
  }
}

