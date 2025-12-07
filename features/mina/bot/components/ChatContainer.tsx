"use client";

import React, { useState, useEffect } from "react";
import { ChatMessage } from "../types";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import QuickActionsBar from "./QuickActionsBar";
import { useMinaChat } from "../hooks/useMinaChat";
import { getMinaGreeting } from "../services/minaPersonality";
import { Sparkles } from "lucide-react";

export default function ChatContainer() {
  const {
    messages,
    isTyping,
    sendMessage,
    handleQuickAction,
  } = useMinaChat();

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: "greeting",
        role: "assistant",
        content: getMinaGreeting(),
        timestamp: new Date(),
      };
      // Note: We don't add greeting to messages state here
      // It will be handled by the hook
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Mina AI Assistant</h2>
          <p className="text-xs text-gray-500">Chí Tâm Hair Salon</p>
        </div>
      </div>

      {/* Messages Area */}
      <ChatMessages messages={messages} isTyping={isTyping} />

      {/* Quick Actions */}
      <QuickActionsBar onActionClick={handleQuickAction} />

      {/* Input Area */}
      <ChatInput onSendMessage={sendMessage} disabled={isTyping} />
    </div>
  );
}

