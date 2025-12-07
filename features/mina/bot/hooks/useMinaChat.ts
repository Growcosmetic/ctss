"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "../types";
import { sendMinaMessage } from "../services/minaApi";
import { getMinaGreeting } from "../services/minaPersonality";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useMinaChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0 && user) {
      const greeting: ChatMessage = {
        id: `greeting-${Date.now()}`,
        role: "assistant",
        content: getMinaGreeting(),
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [user]);

  const appendUserMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    return userMessage;
  }, []);

  const appendAssistantMessage = useCallback((content: string) => {
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    return assistantMessage;
  }, []);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isTyping) return;

      // Add user message
      appendUserMessage(userMessage);

      // Start typing
      setIsTyping(true);
      setCurrentStreamingMessage("");

      try {
        let fullResponse = "";

        await sendMinaMessage(
          {
            userMessage,
            conversationId: conversationId || undefined,
          },
          // onChunk
          (chunk: string) => {
            fullResponse += chunk;
            setCurrentStreamingMessage(fullResponse);
            
            // Check if chunk contains conversationId
            try {
              const parsed = JSON.parse(chunk);
              if (parsed.conversationId) {
                setConversationId(parsed.conversationId);
              }
            } catch {
              // Not JSON, continue
            }
          },
          // onComplete
          (completeMessage: string) => {
            setIsTyping(false);
            setCurrentStreamingMessage("");

            // Add assistant message
            appendAssistantMessage(completeMessage);
          },
          // onError
          (error: Error) => {
            setIsTyping(false);
            setCurrentStreamingMessage("");

            // Add error message
            appendAssistantMessage(
              `Xin lỗi, em gặp lỗi: ${error.message}. Vui lòng thử lại sau.`
            );
          }
        );
      } catch (error) {
        setIsTyping(false);
        setCurrentStreamingMessage("");
        appendAssistantMessage(
          "Xin lỗi, em gặp lỗi khi xử lý. Vui lòng thử lại sau."
        );
      }
    },
    [conversationId, isTyping, appendUserMessage, appendAssistantMessage]
  );

  const handleQuickAction = useCallback(
    (action: string) => {
      const actionMessages: Record<string, string> = {
        customer_profile: "Em muốn xem hồ sơ khách hàng. Chị có thể cho em tên hoặc số điện thoại không?",
        predict_return: "Em muốn dự đoán khi nào khách quay lại. Chị cho em biết tên hoặc số điện thoại khách hàng nhé.",
        upsell_suggestion: "Em muốn gợi ý upsell. Chị cho em biết dịch vụ hoặc hóa đơn hiện tại nhé.",
        stylist_schedule: "Em muốn xem lịch stylist. Chị cho em biết tên stylist hoặc ngày cần xem nhé.",
        service_price: "Em muốn biết giá dịch vụ. Chị cho em biết tên dịch vụ nhé.",
        invoice_history: "Em muốn xem lịch sử hóa đơn. Chị cho em biết tên hoặc số điện thoại khách hàng nhé.",
      };

      const message = actionMessages[action] || `Em muốn ${action}. Chị có thể cung cấp thêm thông tin không?`;
      sendMessage(message);
    },
    [sendMessage]
  );

  // Combine messages with streaming message if typing
  const displayMessages = isTyping && currentStreamingMessage
    ? [...messages, {
        id: "streaming",
        role: "assistant" as const,
        content: currentStreamingMessage,
        timestamp: new Date(),
      }]
    : messages;

  return {
    messages: displayMessages,
    isTyping: isTyping && !currentStreamingMessage, // Only show typing indicator when not streaming
    sendMessage,
    handleQuickAction,
    conversationId,
  };
}

