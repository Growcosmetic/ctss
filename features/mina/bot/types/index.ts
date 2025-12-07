// ============================================
// Mina Chatbot Types
// ============================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    customerId?: string;
    bookingId?: string;
    invoiceId?: string;
    action?: string;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequest {
  userMessage: string;
  conversationId?: string;
  context?: {
    customerId?: string;
    bookingId?: string;
    invoiceId?: string;
  };
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  suggestions?: string[];
  actions?: QuickAction[];
}

export interface QuickAction {
  label: string;
  action: string;
  icon?: string;
}

export interface MinaContext {
  userRole: string;
  customerId?: string;
  bookingId?: string;
  invoiceId?: string;
  stylistId?: string;
}

