// ============================================
// Multi-Channel Integration Types
// ============================================

export type ChannelPlatform = "zalo" | "facebook" | "instagram" | "website";

export interface UnifiedMessage {
  phone?: string;
  platform: ChannelPlatform;
  customerId: string; // Platform-specific ID (zaloUserId, psid, sessionId, etc.)
  message: string;
  attachments?: ChannelAttachment[];
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ChannelAttachment {
  type: "image" | "video" | "file" | "location" | "audio";
  url?: string;
  payload?: any;
}

export interface ChannelWebhookPayload {
  platform: ChannelPlatform;
  customerId: string;
  phone?: string;
  message: string;
  attachments?: any[];
  metadata?: Record<string, any>;
}

export interface ChannelResponse {
  success: boolean;
  reply?: string;
  customerId?: string;
  error?: string;
}

