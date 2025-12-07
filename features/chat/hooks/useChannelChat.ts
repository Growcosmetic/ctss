"use client";

import { useState, useCallback } from "react";

export interface UseChannelChatResult {
  loading: boolean;
  error: string | null;
  sendMessage: (message: string, phone?: string) => Promise<string | null>;
}

export function useChannelChat(sessionId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string, phone?: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/channel/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: "website",
            customerId: sessionId || "anonymous",
            phone: phone || undefined,
            message,
            timestamp: Date.now(),
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to send message");
        }

        return data.reply || null;
      } catch (err: any) {
        setError(err.message || "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  return {
    loading,
    error,
    sendMessage,
  };
}

