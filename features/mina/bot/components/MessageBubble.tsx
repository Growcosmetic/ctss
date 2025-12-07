"use client";

import React from "react";
import { ChatMessage } from "../types";
import { format } from "date-fns";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gradient-to-br from-pink-400 to-purple-500 text-white"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 max-w-[80%] ${
            isUser
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span className="text-xs text-gray-500 mt-1 px-1">
          {format(new Date(message.timestamp), "HH:mm")}
        </span>
      </div>
    </div>
  );
}

