"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { format, isToday, isYesterday } from "date-fns";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export default function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.timestamp), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return "Hôm nay";
    } else if (isYesterday(date)) {
      return "Hôm qua";
    } else {
      return format(date, "dd/MM/yyyy");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-xs text-gray-500 bg-white">
              {formatDateLabel(date)}
            </span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Messages for this date */}
          {dateMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}

