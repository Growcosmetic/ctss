import OpenAI from "openai";

// Initialize OpenAI client lazily (only when needed)
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

// Lazy initialization - only create when needed
let openai: OpenAI | null = null;
function getClient(): OpenAI {
  if (!openai) {
    openai = getOpenAIClient();
  }
  return openai;
}

// Export helper function for other files to use
// This function will NOT throw during build time, only at runtime
export function getOpenAIClientSafe(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  // If no API key, return a mock client that will fail gracefully at runtime
  if (!apiKey) {
    return {
      chat: {
        completions: {
          create: async () => {
            throw new Error("OPENAI_API_KEY is not configured. Please set OPENAI_API_KEY in .env file.");
          },
        },
      },
      audio: {
        speech: {
          create: async () => {
            throw new Error("OPENAI_API_KEY is not configured. Please set OPENAI_API_KEY in .env file.");
          },
        },
        transcriptions: {
          create: async () => {
            throw new Error("OPENAI_API_KEY is not configured. Please set OPENAI_API_KEY in .env file.");
          },
        },
      },
    } as any;
  }
  
  // If API key exists, create real client
  try {
    return new OpenAI({ apiKey });
  } catch (error) {
    // Fallback to mock if creation fails
    return {
      chat: {
        completions: {
          create: async () => {
            throw new Error("Failed to initialize OpenAI client. Please check OPENAI_API_KEY in .env file.");
          },
        },
      },
    } as any;
  }
}

/**
 * Map AI type string to AiLogType enum
 */
function mapAIType(type: string): "CHAT" | "ANALYSIS" | "PREDICTION" | "RECOMMENDATION" | "OTHER" {
  const upperType = type.toUpperCase();
  if (upperType.includes("ANALYSIS") || upperType.includes("PERFORMANCE")) {
    return "ANALYSIS";
  }
  if (upperType.includes("PREDICTION") || upperType.includes("FORECAST")) {
    return "PREDICTION";
  }
  if (upperType.includes("RECOMMENDATION") || upperType.includes("SUGGESTION") || upperType.includes("UPSELL")) {
    return "RECOMMENDATION";
  }
  if (upperType.includes("CHAT")) {
    return "CHAT";
  }
  return "OTHER";
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Call OpenAI API with structured prompt
 */
export async function callOpenAI(
  prompt: string,
  systemPrompt?: string,
  model: string = "gpt-4o" // Using gpt-4o as GPT-5.1 may not be available yet
): Promise<AIResponse<string>> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not configured",
      };
    }

    const client = getClient();
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
        { role: "user" as const, content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        error: "No response from OpenAI",
      };
    }

    return {
      success: true,
      data: content,
    };
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return {
      success: false,
      error: error.message || "Failed to call OpenAI API",
    };
  }
}

/**
 * Parse JSON response from OpenAI
 */
export async function callOpenAIJSON<T = any>(
  prompt: string,
  systemPrompt?: string,
  model: string = "gpt-4o"
): Promise<AIResponse<T>> {
  try {
    const response = await callOpenAI(
      `${prompt}\n\nPlease respond in valid JSON format only.`,
      systemPrompt || "You are a helpful assistant that responds in JSON format.",
      model
    );

    if (!response.success || !response.data) {
      return response as AIResponse<T>;
    }

    // Try to parse JSON from response
    const jsonMatch = response.data.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: parsed,
      };
    }

    return {
      success: false,
      error: "Invalid JSON response from OpenAI",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to parse OpenAI response",
    };
  }
}

/**
 * Log AI usage to database
 */
export async function logAIUsage(
  type: string,
  input: any,
  output: any,
  model: string = "gpt-4o",
  tokens?: number,
  cost?: number,
  duration?: number
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    
    await prisma.aiLog.create({
      data: {
        type: mapAIType(type),
        input: input || {},
        output: output || {},
        model,
        tokens: tokens || null,
        cost: cost ? cost : null,
        duration: duration || null,
        status: "SUCCESS",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to log AI usage:", error);
    return { success: false };
  }
}

