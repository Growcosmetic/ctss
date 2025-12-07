// ============================================
// Channel Normalizer
// Chuẩn hóa dữ liệu từ các kênh về format thống nhất
// ============================================

import type {
  UnifiedMessage,
  ChannelPlatform,
  ChannelWebhookPayload,
} from "./types";

// ============================================
// Normalize Zalo OA Webhook
// ============================================

export function normalizeZaloMessage(payload: any): UnifiedMessage {
  return {
    platform: "zalo",
    customerId: payload.from?.user_id || payload.user_id || payload.customerId,
    phone: payload.from?.phone || payload.phone,
    message: payload.message?.text || payload.text || payload.message || "",
    attachments: payload.message?.attachments?.map((att: any) => ({
      type: att.type || "file",
      url: att.payload?.url,
      payload: att.payload,
    })),
    timestamp: payload.timestamp || Date.now(),
    metadata: {
      zaloUserId: payload.from?.user_id || payload.user_id,
      event: payload.event,
    },
  };
}

// ============================================
// Normalize Facebook Messenger Webhook
// ============================================

export function normalizeFacebookMessage(payload: any): UnifiedMessage {
  // Facebook webhook structure
  const message = payload.message || payload;
  const sender = payload.sender || payload.from;

  return {
    platform: "facebook",
    customerId: sender?.id || payload.psid || payload.customerId,
    phone: payload.phone,
    message: message.text || message.message || payload.text || "",
    attachments: message.attachments?.map((att: any) => ({
      type: att.type || "file",
      url: att.payload?.url,
      payload: att.payload,
    })),
    timestamp: payload.timestamp || message.timestamp || Date.now(),
    metadata: {
      psid: sender?.id || payload.psid,
      pageId: payload.page?.id,
      event: payload.event,
    },
  };
}

// ============================================
// Normalize Instagram DM Webhook
// ============================================

export function normalizeInstagramMessage(payload: any): UnifiedMessage {
  // Instagram webhook structure (similar to Facebook)
  const message = payload.message || payload;
  const sender = payload.sender || payload.from;

  return {
    platform: "instagram",
    customerId: sender?.id || payload.igUserId || payload.customerId,
    phone: payload.phone,
    message: message.text || message.message || payload.text || "",
    attachments: message.attachments?.map((att: any) => ({
      type: att.type || "file",
      url: att.payload?.url,
      payload: att.payload,
    })),
    timestamp: payload.timestamp || message.timestamp || Date.now(),
    metadata: {
      igUserId: sender?.id || payload.igUserId,
      event: payload.event,
    },
  };
}

// ============================================
// Normalize Website Chat Widget
// ============================================

export function normalizeWebsiteMessage(payload: any): UnifiedMessage {
  return {
    platform: "website",
    customerId: payload.sessionId || payload.customerId || payload.id,
    phone: payload.phone,
    message: payload.message || payload.text || "",
    attachments: payload.attachments?.map((att: any) => ({
      type: att.type || "file",
      url: att.url,
      payload: att,
    })),
    timestamp: payload.timestamp || Date.now(),
    metadata: {
      sessionId: payload.sessionId,
      userAgent: payload.userAgent,
      ip: payload.ip,
      url: payload.url,
    },
  };
}

// ============================================
// Universal Normalizer (Auto-detect platform)
// ============================================

export function normalizeChannelMessage(
  payload: ChannelWebhookPayload
): UnifiedMessage {
  const platform = payload.platform;

  switch (platform) {
    case "zalo":
      return normalizeZaloMessage(payload);
    case "facebook":
      return normalizeFacebookMessage(payload);
    case "instagram":
      return normalizeInstagramMessage(payload);
    case "website":
      return normalizeWebsiteMessage(payload);
    default:
      // Fallback: assume it's already in unified format
      return {
        platform: platform as ChannelPlatform,
        customerId: payload.customerId,
        phone: payload.phone,
        message: payload.message,
        attachments: payload.attachments?.map((att) => ({
          type: att.type || "file",
          url: att.url,
          payload: att,
        })),
        timestamp: Date.now(),
        metadata: payload.metadata,
      };
  }
}

