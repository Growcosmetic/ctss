// ============================================
// Mina Chat API Service
// ============================================

import { ChatRequest, ChatResponse } from "../types";

const API_BASE = "/api/mina/chat";

/**
 * Send message to Mina and get streaming response
 */
export async function sendMinaMessage(
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onComplete: (fullMessage: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    let fullMessage = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete(fullMessage);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onComplete(fullMessage);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullMessage += parsed.content;
              onChunk(parsed.content);
            }
            if (parsed.conversationId) {
              // Pass conversationId as chunk so hook can capture it
              onChunk(JSON.stringify({ conversationId: parsed.conversationId }));
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Unknown error"));
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(
  conversationId: string
): Promise<ChatResponse[]> {
  try {
    const response = await fetch(`${API_BASE}/history?conversationId=${conversationId}`);
    if (!response.ok) {
      throw new Error("Failed to get conversation history");
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error getting conversation history:", error);
    return [];
  }
}

